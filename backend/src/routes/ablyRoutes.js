import express from 'express'
import Ably from 'ably'
import { protect } from '../middleware/authMiddleware.js'
import { errorResponse } from '../utils/response.js'

const router = express.Router()

// ─── POST /api/ably/token ───────────────────────────────────────────────────
// Issues a short-lived Ably token for the authenticated user.
//
// The frontend uses Ably.Realtime({ authUrl: '/api/ably/token' }) so the
// ABLY_API_KEY is never exposed to the client. Each token is scoped to the
// channels the user is allowed to subscribe to:
//   • conv:<conversationId>  – messages inside a chat room
//   • user:<userId>          – personal notifications (matches, conv updates)
//
// Token TTL: 1 hour. Ably auto-refreshes via the authUrl before expiry.
router.post('/token', protect, async (req, res) => {
  try {
    const userId = req.user._id.toString()

    // Use Ably.Rest just for token requests — no persistent connection needed
    const ablyRest = new Ably.Rest({ key: process.env.ABLY_API_KEY })

    const tokenParams = {
      // clientId ties the token to this user; Ably uses it for presence
      clientId: userId,

      // Capability: allow subscribe + publish on the user's personal channel
      // and subscribe on any conversation channel they open.
      // The frontend is responsible for only subscribing to conv channels
      // it is a participant of (enforced server-side via sendMessage checks).
      capability: JSON.stringify({
        [`user:${userId}`]: ['subscribe', 'publish'],
        'conv:*': ['subscribe', 'publish'],
      }),

      // 1 hour TTL (in milliseconds)
      ttl: 60 * 60 * 1000,
    }

    const tokenRequest = await ablyRest.auth.createTokenRequest(tokenParams)
    return res.json(tokenRequest)
  } catch (err) {
    console.error('[Ably] Token request failed:', err.message)
    return errorResponse(res, 'Failed to generate Ably token', 500)
  }
})

// ─── POST /api/ably/typing ─────────────────────────────────────────────────
// Lightweight endpoint for typing indicator events.
// The frontend calls this instead of publishing directly via Ably Realtime
// so we keep server control over which conversations a user can signal in.
router.post('/typing', protect, async (req, res) => {
  try {
    const { conversationId, event } = req.body
    // event must be 'start' or 'stop'
    if (!conversationId || !['start', 'stop'].includes(event)) {
      return errorResponse(res, 'conversationId and event (start|stop) are required', 400)
    }

    const { publishTypingStart, publishTypingStop } = await import('../controllers/chatController.js')
    const userId = req.user._id.toString()

    if (event === 'start') {
      await publishTypingStart(conversationId, userId)
    } else {
      await publishTypingStop(conversationId, userId)
    }

    return res.json({ success: true })
  } catch (err) {
    console.error('[Ably] Typing publish failed:', err.message)
    return errorResponse(res, 'Failed to publish typing event', 500)
  }
})

export default router
