import express from 'express'
import {
  getConversations,
  getOrCreateConversation,
  getMessages,
  sendMessage,
  markAsRead,
} from '../controllers/chatController.js'
import { protect } from '../middleware/authMiddleware.js'

const router = express.Router()

// All chat routes require authentication
router.use(protect)

// Conversations
router.get('/conversations', getConversations)
router.get('/conversations/:matchId/with', getOrCreateConversation)

// Messages
router.get('/conversations/:conversationId/messages', getMessages)
router.post('/conversations/:conversationId/messages', sendMessage)
router.put('/conversations/:conversationId/read', markAsRead)

export default router
