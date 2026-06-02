import { io } from 'socket.io-client'
import { useChatStore } from '../store/chatStore'

const SOCKET_URL = import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL.replace('/api', '')
  : 'http://localhost:5000'

let socket = null

export const getSocket = () => socket

export const connectSocket = (token) => {
  if (socket?.connected) return socket

  socket = io(SOCKET_URL, {
    auth: { token },
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  })

  socket.on('connect', () => {
    console.log('✅ Socket connected:', socket.id)
  })

  socket.on('disconnect', (reason) => {
    console.log('❌ Socket disconnected:', reason)
  })

  socket.on('connect_error', (err) => {
    console.error('Socket connection error:', err.message)
  })

  // ── Incoming message ──────────────────────────────────────────────────
  socket.on('new:message', (message) => {
    const { activeConversation, appendMessage } = useChatStore.getState()
    const convId = String(message.conversationId)
    if (String(activeConversation?.id || activeConversation?._id) === convId) {
      appendMessage(message)
    }
  })

  // ── Conversation updated (last message, unread counts) ────────────────
  socket.on('conversation:updated', ({ conversation }) => {
    useChatStore.getState().updateConversation(conversation)
  })

  // ── New mutual match → a new conversation was just created server-side.
  //    Refresh the conversations list so it appears in ChatsPage immediately.
  socket.on('new:match', () => {
    useChatStore.getState().fetchConversations()
  })

  // ── Typing indicators ─────────────────────────────────────────────────
  socket.on('typing:start', ({ userId, conversationId }) => {
    useChatStore.getState().setTyping(conversationId, userId, true)
  })

  socket.on('typing:stop', ({ userId, conversationId }) => {
    useChatStore.getState().setTyping(conversationId, userId, false)
  })

  // ── Read receipts ─────────────────────────────────────────────────────
  socket.on('messages:read', ({ conversationId, readBy }) => {
    console.log(`Messages in ${conversationId} read by ${readBy}`)
  })

  return socket
}

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect()
    socket = null
  }
}

export const joinConversation = (conversationId) => {
  if (socket?.connected) socket.emit('join:conversation', { conversationId })
}

export const leaveConversation = (conversationId) => {
  if (socket?.connected) socket.emit('leave:conversation', { conversationId })
}

export const sendSocketMessage = (conversationId, text) => {
  if (socket?.connected) {
    socket.emit('send:message', { conversationId, text })
    return true
  }
  return false
}

export const emitTypingStart = (conversationId) => {
  if (socket?.connected) socket.emit('typing:start', { conversationId })
}

export const emitTypingStop = (conversationId) => {
  if (socket?.connected) socket.emit('typing:stop', { conversationId })
}
