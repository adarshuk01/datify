import express from 'express'
import {
  signup,
  login,
  verifyEmail,
  resendVerification,
  forgotPassword,
  resetPassword,
  getMe,
} from '../controllers/authController.js'
import { protect } from '../middleware/authMiddleware.js'
import { authLimiter } from '../middleware/rateLimiter.js'
import {
  signupValidation,
  loginValidation,
} from '../middleware/validationMiddleware.js'

const router = express.Router()

// Public routes
router.post('/signup', authLimiter, signupValidation, signup)
router.post('/login', authLimiter, loginValidation, login)
router.get('/verify-email/:token', verifyEmail)
router.post('/resend-verification', authLimiter, resendVerification)
router.post('/forgot-password', authLimiter, forgotPassword)
router.post('/reset-password/:token', authLimiter, resetPassword)

// Private routes
router.get('/me', protect, getMe)

export default router
