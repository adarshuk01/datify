import Conversation from '../models/Conversation.js'
import Message from '../models/Message.js'
import User from '../models/User.js'
import { successResponse, errorResponse } from '../utils/response.js'

// ─── Helper: check mutual match ────────────────────────────────────────────
const areMutualMatches = async (userAId, userBId) => {
  const [userA, userB] = await Promise.all([
    User.findById(userAId).select('likedUsers superLikedUsers'),
    User.findById(userBId).select('likedUsers superLikedUsers'),
  ])
  if (!userA || !userB) return false

  const aLikedB =
    userA.likedUsers.map(String).includes(String(userBId)) ||
    userA.superLikedUsers.map(String).includes(String(userBId))

  const bLikedA =
    userB.likedUsers.map(String).includes(String(userAId)) ||
    userB.superLikedUsers.map(String).includes(String(userAId))

  return aLikedB && bLikedA
}

// ─── Format helper ─────────────────────────────────────────────────────────
export const formatConversation = (conv, myId) => {
  const other = conv.participants?.find((p) => String(p._id || p) !== myId)
  const lastMsg = conv.lastMessage

  return {
    id: conv._id,
    _id: conv._id,
    participant: other
      ? {
          id: other._id,
          name: other.name || 'User',
          photo: other.photos?.[0]?.url || other.photos?.[0] || null,
          lastActive: other.lastActive || null,
        }
      : null,
    lastMessage: lastMsg
      ? {
          text: lastMsg.text,
          sender: String(lastMsg.sender),
          createdAt: lastMsg.createdAt,
        }
      : null,
    lastMessageAt: conv.lastMessageAt,
    unreadCount: conv.unreadCounts?.get?.(myId) ?? (conv.unreadCounts?.[myId] || 0),
    updatedAt: conv.updatedAt,
    createdAt: conv.createdAt,
  }
}

// ─── List all conversations for current user (only mutual matches) ─────────
// This is the main endpoint for ChatsPage.
// It also auto-creates conversations for any mutual match that doesn't have one yet,
// so every new mutual like instantly appears in the chat list.
export const getConversations = async (req, res) => {
  try {
    const myId = req.user._id.toString()

    // 1. Load current user with liked/superLiked lists populated
    const currentUser = await User.findById(myId)
      .populate('likedUsers',      'name age photos lastActive likedUsers superLikedUsers')
      .populate('superLikedUsers', 'name age photos lastActive likedUsers superLikedUsers')

    if (!currentUser) return errorResponse(res, 'User not found', 404)

    // 2. Collect all mutual matches (both parties liked each other)
    const mutualMatchIds = new Set()
    const mutualMatchUsers = {}

    for (const liked of currentUser.likedUsers) {
      const theyLikedMe =
        liked.likedUsers?.map(String).includes(myId) ||
        liked.superLikedUsers?.map(String).includes(myId)
      if (theyLikedMe) {
        const uid = String(liked._id)
        mutualMatchIds.add(uid)
        mutualMatchUsers[uid] = liked
      }
    }
    for (const superLiked of currentUser.superLikedUsers) {
      const theyLikedMe =
        superLiked.likedUsers?.map(String).includes(myId) ||
        superLiked.superLikedUsers?.map(String).includes(myId)
      if (theyLikedMe) {
        const uid = String(superLiked._id)
        mutualMatchIds.add(uid)
        mutualMatchUsers[uid] = superLiked
      }
    }

    // 3. Load existing conversations with mutual matches
    const existingConvs = await Conversation.find({
      participants: { $all: [myId] },
    })
      .populate('lastMessage')
      .populate('participants', 'name photos lastActive')

    const existingByOtherUser = {}
    for (const conv of existingConvs) {
      const other = conv.participants.find((p) => String(p._id) !== myId)
      if (other) existingByOtherUser[String(other._id)] = conv
    }

    // 4. For every mutual match that has NO conversation yet — create one silently
    const toCreate = [...mutualMatchIds].filter((uid) => !existingByOtherUser[uid])
    if (toCreate.length > 0) {
      await Promise.all(
        toCreate.map((uid) =>
          Conversation.create({
            participants: [myId, uid],
            unreadCounts: { [myId]: 0, [uid]: 0 },
          })
        )
      )
      // Reload conversations after creation
      const freshConvs = await Conversation.find({
        participants: { $all: [myId] },
      })
        .populate('lastMessage')
        .populate('participants', 'name photos lastActive')

      for (const conv of freshConvs) {
        const other = conv.participants.find((p) => String(p._id) !== myId)
        if (other) existingByOtherUser[String(other._id)] = conv
      }
    }

    // 5. Return only conversations with mutual matches, sorted by last activity
    const result = [...mutualMatchIds]
      .map((uid) => existingByOtherUser[uid])
      .filter(Boolean)
      .sort((a, b) => {
        // Conversations with messages come first; then by createdAt
        const ta = a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : new Date(a.createdAt).getTime()
        const tb = b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : new Date(b.createdAt).getTime()
        return tb - ta
      })
      .map((c) => formatConversation(c, myId))

    return successResponse(res, { conversations: result })
  } catch (error) {
    console.error('Get conversations error:', error)
    return errorResponse(res, 'Failed to get conversations')
  }
}

// ─── Get or create conversation (kept for direct access) ──────────────────
export const getOrCreateConversation = async (req, res) => {
  try {
    const { matchId } = req.params
    const myId = req.user._id.toString()

    if (matchId === myId) {
      return errorResponse(res, 'Cannot chat with yourself', 400)
    }

    const matched = await areMutualMatches(myId, matchId)
    if (!matched) {
      return errorResponse(res, 'You can only chat with mutual matches', 403)
    }

    let conversation = await Conversation.findOne({
      participants: { $all: [myId, matchId], $size: 2 },
    })
      .populate('lastMessage')
      .populate('participants', 'name photos lastActive')

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [myId, matchId],
        unreadCounts: { [myId]: 0, [matchId]: 0 },
      })
      await conversation.populate('participants', 'name photos lastActive')
    }

    return successResponse(res, { conversation: formatConversation(conversation, myId) })
  } catch (error) {
    console.error('Get/create conversation error:', error)
    return errorResponse(res, 'Failed to get conversation')
  }
}

// ─── Get messages in a conversation (paginated) ───────────────────────────
export const getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params
    const myId = req.user._id.toString()
    const { page = 1, limit = 30 } = req.query

    const conversation = await Conversation.findById(conversationId)
    if (!conversation) return errorResponse(res, 'Conversation not found', 404)
    if (!conversation.participants.map(String).includes(myId)) {
      return errorResponse(res, 'Access denied', 403)
    }

    const skip = (Number(page) - 1) * Number(limit)

    const [messages, total] = await Promise.all([
      Message.find({ conversationId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      Message.countDocuments({ conversationId }),
    ])

    // Mark unread as read
    await Message.updateMany(
      { conversationId, readBy: { $ne: myId } },
      { $addToSet: { readBy: myId } }
    )
    await Conversation.findByIdAndUpdate(conversationId, {
      $set: { [`unreadCounts.${myId}`]: 0 },
    })

    return successResponse(res, {
      messages: messages.reverse(),
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
    })
  } catch (error) {
    console.error('Get messages error:', error)
    return errorResponse(res, 'Failed to get messages')
  }
}

// ─── Send a message (REST fallback) ──────────────────────────────────────
export const sendMessage = async (req, res) => {
  try {
    const { conversationId } = req.params
    const myId = req.user._id.toString()
    const { text } = req.body

    if (!text?.trim()) return errorResponse(res, 'Message text is required', 400)

    const conversation = await Conversation.findById(conversationId)
    if (!conversation) return errorResponse(res, 'Conversation not found', 404)
    if (!conversation.participants.map(String).includes(myId)) {
      return errorResponse(res, 'Access denied', 403)
    }

    const message = await Message.create({
      conversationId,
      sender: myId,
      text: text.trim(),
      readBy: [myId],
    })

    const otherParticipants = conversation.participants.map(String).filter((id) => id !== myId)
    const unreadUpdates = {}
    for (const pid of otherParticipants) {
      const current = conversation.unreadCounts?.get(pid) || 0
      unreadUpdates[`unreadCounts.${pid}`] = current + 1
    }

    await Conversation.findByIdAndUpdate(conversationId, {
      $set: { lastMessage: message._id, lastMessageAt: message.createdAt, ...unreadUpdates },
    })

    return successResponse(res, { message }, 'Message sent', 201)
  } catch (error) {
    console.error('Send message error:', error)
    return errorResponse(res, 'Failed to send message')
  }
}

// ─── Mark as read ──────────────────────────────────────────────────────────
export const markAsRead = async (req, res) => {
  try {
    const { conversationId } = req.params
    const myId = req.user._id.toString()

    const conversation = await Conversation.findById(conversationId)
    if (!conversation) return errorResponse(res, 'Conversation not found', 404)
    if (!conversation.participants.map(String).includes(myId)) {
      return errorResponse(res, 'Access denied', 403)
    }

    await Message.updateMany(
      { conversationId, readBy: { $ne: myId } },
      { $addToSet: { readBy: myId } }
    )
    await Conversation.findByIdAndUpdate(conversationId, {
      $set: { [`unreadCounts.${myId}`]: 0 },
    })

    return successResponse(res, {}, 'Marked as read')
  } catch (error) {
    return errorResponse(res, 'Failed to mark as read')
  }
}
