import { verifyToken } from '../utils/jwt.js'
import User from '../models/User.js'
import Conversation from '../models/Conversation.js'
import Message from '../models/Message.js'
import { formatConversation } from '../controllers/chatController.js'

export const initSocket = (io) => {

  // Make io accessible globally so controllers can emit events
  global._io = io

  // ── Auth middleware ────────────────────────────────────────────────────
  io.use(async (socket, next) => {
    try {
      const token =
        socket.handshake.auth?.token ||
        socket.handshake.headers?.authorization?.split(' ')[1]
      if (!token) return next(new Error('Authentication required'))
      const decoded = verifyToken(token)
      const user = await User.findById(decoded.id).select('-password')
      if (!user) return next(new Error('User not found'))
      socket.user = user
      next()
    } catch (err) {
      next(new Error('Invalid token'))
    }
  })

  io.on('connection', (socket) => {
    const myId = socket.user._id.toString()
    console.log(`🔌 Connected: ${socket.user.name || myId}`)

    // Personal room for DMs / notifications
    socket.join(`user:${myId}`)

    // Update lastActive
    User.findByIdAndUpdate(myId, { lastActive: new Date() }).catch(() => {})

    // ── Join conversation room ───────────────────────────────────────────
    socket.on('join:conversation', async ({ conversationId }) => {
      try {
        const conv = await Conversation.findById(conversationId)
        if (!conv) return socket.emit('error', { message: 'Conversation not found' })
        if (!conv.participants.map(String).includes(myId))
          return socket.emit('error', { message: 'Access denied' })
        socket.join(`conv:${conversationId}`)
        socket.emit('joined:conversation', { conversationId })
      } catch {
        socket.emit('error', { message: 'Failed to join conversation' })
      }
    })

    // ── Leave conversation room ──────────────────────────────────────────
    socket.on('leave:conversation', ({ conversationId }) => {
      socket.leave(`conv:${conversationId}`)
    })

    // ── Send a message ───────────────────────────────────────────────────
    socket.on('send:message', async ({ conversationId, text }) => {
      try {
        if (!text?.trim()) return

        const conversation = await Conversation.findById(conversationId)
        if (!conversation) return socket.emit('error', { message: 'Conversation not found' })
        if (!conversation.participants.map(String).includes(myId))
          return socket.emit('error', { message: 'Access denied' })

        const message = await Message.create({
          conversationId,
          sender: myId,
          text: text.trim(),
          readBy: [myId],
        })

        const otherIds = conversation.participants.map(String).filter((id) => id !== myId)
        const unreadUpdates = {}
        for (const pid of otherIds) {
          unreadUpdates[`unreadCounts.${pid}`] = (conversation.unreadCounts?.get(pid) || 0) + 1
        }

        const updatedConv = await Conversation.findByIdAndUpdate(
          conversationId,
          { $set: { lastMessage: message._id, lastMessageAt: message.createdAt, ...unreadUpdates } },
          { new: true }
        )
          .populate('lastMessage')
          .populate('participants', 'name photos lastActive')

        const msgPayload = {
          _id: message._id,
          conversationId,
          sender: myId,
          text: message.text,
          createdAt: message.createdAt,
          readBy: [myId],
        }

        // Broadcast message to everyone in the room
        io.to(`conv:${conversationId}`).emit('new:message', msgPayload)

        // Notify all participants with updated conversation metadata
        for (const pid of otherIds) {
          io.to(`user:${pid}`).emit('conversation:updated', {
            conversation: formatConversation(updatedConv, pid),
          })
        }
        io.to(`user:${myId}`).emit('conversation:updated', {
          conversation: formatConversation(updatedConv, myId),
        })
      } catch (err) {
        console.error('Socket send message error:', err)
        socket.emit('error', { message: 'Failed to send message' })
      }
    })

    // ── Typing indicators ────────────────────────────────────────────────
    socket.on('typing:start', ({ conversationId }) => {
      socket.to(`conv:${conversationId}`).emit('typing:start', { userId: myId, conversationId })
    })

    socket.on('typing:stop', ({ conversationId }) => {
      socket.to(`conv:${conversationId}`).emit('typing:stop', { userId: myId, conversationId })
    })

    // ── Mark as read ─────────────────────────────────────────────────────
    socket.on('mark:read', async ({ conversationId }) => {
      try {
        await Message.updateMany(
          { conversationId, readBy: { $ne: myId } },
          { $addToSet: { readBy: myId } }
        )
        await Conversation.findByIdAndUpdate(conversationId, {
          $set: { [`unreadCounts.${myId}`]: 0 },
        })
        socket.to(`conv:${conversationId}`).emit('messages:read', { conversationId, readBy: myId })
      } catch (err) {
        console.error('Mark read error:', err)
      }
    })

    // ── Disconnect ───────────────────────────────────────────────────────
    socket.on('disconnect', () => {
      User.findByIdAndUpdate(myId, { lastActive: new Date() }).catch(() => {})
      console.log(`🔌 Disconnected: ${socket.user.name || myId}`)
    })
  })
}

// ── Helper: notify both users when a new match/conversation is created ─────
export const emitNewMatch = (userAId, userBId) => {
  const io = global._io
  if (!io) return
  io.to(`user:${userAId}`).emit('new:match')
  io.to(`user:${userBId}`).emit('new:match')
}
