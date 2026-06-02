import { create } from 'zustand'
import api from '../services/api'
import { getSocket } from '../services/socketService'

export const useChatStore = create((set, get) => ({
  conversations: [],       // mutual matches — always populated by backend
  activeConversation: null,
  messages: [],
  isLoadingConversations: false,
  isLoadingMessages: false,
  typingUsers: {},          // { conversationId: { userId: true } }
  totalUnread: 0,

  // ── Fetch all conversations (= all mutual matches) ──────────────────────
  // Backend auto-creates conversation rows for every mutual like, so this
  // always returns the full up-to-date list.
  fetchConversations: async () => {
    set({ isLoadingConversations: true })
    try {
      const res = await api.get('/chat/conversations')
      const conversations = res.data?.data?.conversations || []
      const totalUnread = conversations.reduce((sum, c) => sum + (c.unreadCount || 0), 0)
      set({ conversations, totalUnread, isLoadingConversations: false })
    } catch (err) {
      console.error('Fetch conversations error:', err)
      set({ isLoadingConversations: false })
    }
  },

  // ── Set active conversation ─────────────────────────────────────────────
  setActiveConversation: (conv) => set({ activeConversation: conv, messages: [] }),

  // ── Fetch messages for a conversation ──────────────────────────────────
  fetchMessages: async (conversationId, page = 1) => {
    set({ isLoadingMessages: true })
    try {
      const res = await api.get(
        `/chat/conversations/${conversationId}/messages?page=${page}&limit=30`
      )
      const data = res.data?.data || {}
      const msgs = data.messages || []
      set((state) => ({
        messages: page === 1 ? msgs : [...msgs, ...state.messages],
        isLoadingMessages: false,
      }))
      return data
    } catch (err) {
      console.error('Fetch messages error:', err)
      set({ isLoadingMessages: false })
      return null
    }
  },

  // ── Append an incoming socket message ───────────────────────────────────
  appendMessage: (message) => {
    set((state) => ({ messages: [...state.messages, message] }))
  },

  // ── Update a conversation in the list (from socket or after send) ───────
  updateConversation: (updatedConv) => {
    set((state) => {
      const id = String(updatedConv.id || updatedConv._id)
      const exists = state.conversations.find((c) => String(c.id || c._id) === id)

      const newList = exists
        ? state.conversations.map((c) => (String(c.id || c._id) === id ? updatedConv : c))
        : [updatedConv, ...state.conversations]

      // Conversations with messages first, then by lastMessageAt desc
      newList.sort((a, b) => {
        const hasA = !!a.lastMessage
        const hasB = !!b.lastMessage
        if (hasA !== hasB) return hasB ? 1 : -1
        const ta = a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : new Date(a.createdAt || 0).getTime()
        const tb = b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : new Date(b.createdAt || 0).getTime()
        return tb - ta
      })

      const totalUnread = newList.reduce((sum, c) => sum + (c.unreadCount || 0), 0)
      return { conversations: newList, totalUnread }
    })
  },

  // ── Mark conversation as read ───────────────────────────────────────────
  markAsRead: async (conversationId) => {
    try {
      await api.put(`/chat/conversations/${conversationId}/read`)
      set((state) => {
        const newList = state.conversations.map((c) =>
          String(c.id || c._id) === String(conversationId) ? { ...c, unreadCount: 0 } : c
        )
        return {
          conversations: newList,
          totalUnread: newList.reduce((sum, c) => sum + (c.unreadCount || 0), 0),
        }
      })
      const socket = getSocket()
      if (socket) socket.emit('mark:read', { conversationId })
    } catch (err) {
      console.error('Mark as read error:', err)
    }
  },

  // ── Typing indicators ───────────────────────────────────────────────────
  setTyping: (conversationId, userId, isTyping) => {
    set((state) => {
      const conv = state.typingUsers[conversationId] || {}
      if (isTyping) {
        return { typingUsers: { ...state.typingUsers, [conversationId]: { ...conv, [userId]: true } } }
      }
      const updated = { ...conv }
      delete updated[userId]
      return { typingUsers: { ...state.typingUsers, [conversationId]: updated } }
    })
  },

  isTyping: (conversationId) => {
    const typing = get().typingUsers[conversationId] || {}
    return Object.keys(typing).length > 0
  },

  clearMessages: () => set({ messages: [], activeConversation: null }),
}))
