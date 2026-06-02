// ── ablyService.js ──────────────────────────────────────────────────────────
// Replaces socketService.js. Uses Ably Realtime instead of Socket.IO.
//
// Architecture:
//   • One persistent Ably.Realtime client per session (lazy-init on connect)
//   • Token auth: client calls POST /api/ably/token with the JWT — the
//     ABLY_API_KEY is never exposed in the browser
//   • Two channel namespaces:
//       conv:<conversationId>  — messages, typing, read receipts
//       user:<userId>          — personal events (new match, conv updates)
//   • Sending a message: POST /api/chat/conversations/:id/messages (REST)
//     The server saves to DB then publishes to Ably → all subscribers receive
//     it, including the sender on other devices
//   • Typing indicators: POST /api/ably/typing (server-validated)
//
// Drop-in for socketService.js — same export names used in ChatRoomPage / App.

import * as Ably from 'ably'
import api from './api'
import { useChatStore } from '../store/chatStore'

let client = null          // Ably.Realtime instance
let userId = null          // current user id (for channel scoping)
const channelRefs = {}     // { channelName: Ably.RealtimeChannel }

// ── Internal helpers ────────────────────────────────────────────────────────

const getChannel = (name) => {
  if (!client) return null
  if (!channelRefs[name]) {
    channelRefs[name] = client.channels.get(name)
  }
  return channelRefs[name]
}

const releaseChannel = (name) => {
  const ch = channelRefs[name]
  if (ch) {
    ch.unsubscribe()
    ch.detach().catch(() => {})
    delete channelRefs[name]
  }
}

// ── Connect (called from App.jsx on login) ───────────────────────────────────
export const connectSocket = (token, currentUserId) => {
  if (client) return // already connected

  userId = currentUserId

  client = new Ably.Realtime({
    // Token auth: server issues a scoped, short-lived token.
    // authCallback is called once on init and then auto-refreshed before TTL.
    authCallback: async (_tokenParams, callback) => {
      try {
        // We need to pass the JWT ourselves because Ably's authUrl doesn't
        // support dynamic headers easily on token refresh — using authCallback
        // gives us full control.
        const res = await api.post('/ably/token')
        callback(null, res.data)
      } catch (err) {
        callback(err, null)
      }
    },
    // clientId is set by the token (server binds it to userId)
    echoMessages: true, // we want the sender to receive their own message via Ably
  })

  client.connection.on('connected', () => {
    console.log('✅ Ably connected')
    subscribeUserChannel(currentUserId)
  })

  client.connection.on('disconnected', () => {
    console.log('⚠️ Ably disconnected — will reconnect automatically')
  })

  client.connection.on('failed', (err) => {
    console.error('❌ Ably connection failed:', err)
  })
}

// ── Disconnect (called from App.jsx on logout) ───────────────────────────────
export const disconnectSocket = () => {
  if (!client) return
  Object.keys(channelRefs).forEach(releaseChannel)
  client.close()
  client = null
  userId = null
}

// ── Personal user channel ────────────────────────────────────────────────────
// Subscribed once on connect; carries new:match and conversation:updated events.
const subscribeUserChannel = (uid) => {
  const ch = getChannel(`user:${uid}`)
  if (!ch) return

  ch.subscribe('new:match', () => {
    // Refresh conversations list so the new match appears immediately
    useChatStore.getState().fetchConversations()
  })

  ch.subscribe('conversation:updated', ({ data }) => {
    if (data?.conversation) {
      useChatStore.getState().updateConversation(data.conversation)
    }
  })
}

// ── Join a conversation channel (called when ChatRoomPage mounts) ────────────
export const joinConversation = (conversationId) => {
  const ch = getChannel(`conv:${conversationId}`)
  if (!ch) return

  ch.subscribe('new:message', ({ data: message }) => {
    const { activeConversation, appendMessage, markAsRead } = useChatStore.getState()
    const convId = String(message.conversationId)
    if (String(activeConversation?.id || activeConversation?._id) === convId) {
      appendMessage(message)
      markAsRead(conversationId)
    }
  })

  ch.subscribe('typing:start', ({ data }) => {
    useChatStore.getState().setTyping(conversationId, data.userId, true)
  })

  ch.subscribe('typing:stop', ({ data }) => {
    useChatStore.getState().setTyping(conversationId, data.userId, false)
  })

  ch.subscribe('messages:read', ({ data }) => {
    console.log(`Messages in ${data.conversationId} read by ${data.readBy}`)
  })
}

// ── Leave a conversation channel (called when ChatRoomPage unmounts) ─────────
export const leaveConversation = (conversationId) => {
  releaseChannel(`conv:${conversationId}`)
}

// ── Send message via REST (server saves + publishes to Ably) ─────────────────
// Always uses REST — never fires directly to Ably from the client.
// The server-side publish via Ably.Rest guarantees the message is persisted
// before subscribers receive it.
export const sendSocketMessage = async (conversationId, text) => {
  try {
    const res = await api.post(`/chat/conversations/${conversationId}/messages`, { text })
    // Return the saved message so ChatRoomPage can do an optimistic update
    // if needed (though the Ably echo will also deliver it)
    return res.data?.data?.message || null
  } catch (err) {
    console.error('Send message error:', err)
    return null
  }
}

// ── Typing indicators via REST ───────────────────────────────────────────────
export const emitTypingStart = async (conversationId) => {
  try {
    await api.post('/ably/typing', { conversationId, event: 'start' })
  } catch (_) {}
}

export const emitTypingStop = async (conversationId) => {
  try {
    await api.post('/ably/typing', { conversationId, event: 'stop' })
  } catch (_) {}
}

// ── Compat shim — getSocket() was used in chatStore; return a duck-type ──────
// chatStore.markAsRead used to do socket.emit('mark:read', …) — that's now
// handled by the REST PUT /chat/conversations/:id/read which the server uses
// to publish messages:read to Ably. No socket object needed.
export const getSocket = () => null
