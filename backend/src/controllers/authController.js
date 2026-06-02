import User from '../models/User.js'
import { generateToken, generateEmailToken, hashToken } from '../utils/jwt.js'
import { sendVerificationEmail, sendPasswordResetEmail } from '../config/email.js'
import { successResponse, errorResponse } from '../utils/response.js'

// Helper — safe user shape to return to client (ALL fields)
const safeUser = (user) => ({
  id:    user._id,
  email: user.email,
  name:  user.name  || null,
  age:   user.age   || null,
  birthday: user.birthday || null,
  bio:   user.bio   || null,
  isEmailVerified:     user.isEmailVerified,
  profileCompletion:   user.profileCompletion   || 15,
  profileSetupComplete: user.profileSetupComplete || false,
  isPremium:           user.isPremium            || false,
  gender:              user.gender               || null,
  pronouns:            user.pronouns             || null,
  interestedIn:        user.interestedIn         || null,
  height:              user.height               || null,
  weight:              user.weight               || null,
  jobTitle:            user.jobTitle             || null,
  company:             user.company              || null,
  school:              user.school               || null,
  interests:           user.interests            || [],
  languages:           user.languages            || [],
  relationshipGoal:    user.relationshipGoal     || '',
  distancePreference:  user.distancePreference   || 80,
  socialMedia:         user.socialMedia          || {},
  primaryPhoto:        user.primaryPhoto         || null,
  photos: (user.photos || []).map((p) => ({ _id: p._id, url: p.url, publicId: p.publicId, isPrimary: p.isPrimary })),
  // CRITICAL: must include location so MainRoute can check coordinates
  location: {
    city:        user.location?.city        || null,
    country:     user.location?.country     || null,
    coordinates: user.location?.coordinates || [],
  },
})

// @desc   Register new user
// @route  POST /api/auth/signup
// @access Public
export const signup = async (req, res) => {
  try {
    const { email, password } = req.body

    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return errorResponse(res, 'An account with this email already exists', 409)
    }

    const rawToken    = generateEmailToken()
    const hashedToken = hashToken(rawToken)

    const user = await User.create({
      email,
      password,
      emailVerificationToken:   hashedToken,
      emailVerificationExpires: new Date(Date.now() + 24 * 60 * 60 * 1000),
    })

    try {
      await sendVerificationEmail(email, rawToken)
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError.message)
    }

    return successResponse(
      res,
      { email: user.email, id: user._id },
      'Account created! Please check your email to verify your account.',
      201
    )
  } catch (error) {
    console.error('Signup error:', error)
    if (error.code === 11000) {
      return errorResponse(res, 'An account with this email already exists', 409)
    }
    return errorResponse(res, 'Failed to create account. Please try again.')
  }
}

// @desc   Login user
// @route  POST /api/auth/login
// @access Public
export const login = async (req, res) => {
  try {
    const { email, password } = req.body

    const user = await User.findOne({ email }).select('+password')
    if (!user) return errorResponse(res, 'Invalid email or password', 401)

    const isMatch = await user.comparePassword(password)
    if (!isMatch) return errorResponse(res, 'Invalid email or password', 401)

    user.lastActive = new Date()
    await user.save({ validateBeforeSave: false })

    const token = generateToken(user._id)

    return successResponse(res, { token, user: safeUser(user) }, 'Login successful')
  } catch (error) {
    console.error('Login error:', error)
    return errorResponse(res, 'Login failed. Please try again.')
  }
}

// @desc   Verify email
// @route  GET /api/auth/verify-email/:token
// @access Public
export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params
    const hashedToken = hashToken(token)

    const user = await User.findOne({
      emailVerificationToken:   hashedToken,
      emailVerificationExpires: { $gt: Date.now() },
    })

    if (!user) return errorResponse(res, 'Invalid or expired verification link', 400)

    user.isEmailVerified          = true
    user.emailVerificationToken   = undefined
    user.emailVerificationExpires = undefined
    await user.save({ validateBeforeSave: false })

    const authToken = generateToken(user._id)

    return successResponse(res, { token: authToken, user: safeUser(user) }, 'Email verified successfully!')
  } catch (error) {
    console.error('Email verification error:', error)
    return errorResponse(res, 'Email verification failed')
  }
}

// @desc   Resend verification email
// @route  POST /api/auth/resend-verification
// @access Public
export const resendVerification = async (req, res) => {
  try {
    const { email } = req.body

    const user = await User.findOne({ email })
    if (!user) {
      return successResponse(res, {}, 'If this email exists, a verification link has been sent.')
    }

    if (user.isEmailVerified) {
      return errorResponse(res, 'This email is already verified', 400)
    }

    const rawToken    = generateEmailToken()
    const hashedToken = hashToken(rawToken)

    user.emailVerificationToken   = hashedToken
    user.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000)
    await user.save({ validateBeforeSave: false })

    await sendVerificationEmail(email, rawToken)

    return successResponse(res, {}, 'Verification email resent!')
  } catch (error) {
    console.error('Resend verification error:', error)
    return errorResponse(res, 'Failed to resend verification email')
  }
}

// @desc   Forgot password
// @route  POST /api/auth/forgot-password
// @access Public
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body

    const user = await User.findOne({ email })
    if (!user) {
      return successResponse(res, {}, 'If this email exists, a reset link has been sent.')
    }

    const rawToken    = generateEmailToken()
    const hashedToken = hashToken(rawToken)

    user.passwordResetToken   = hashedToken
    user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000)
    await user.save({ validateBeforeSave: false })

    await sendPasswordResetEmail(email, rawToken)

    return successResponse(res, {}, 'Password reset link sent!')
  } catch (error) {
    console.error('Forgot password error:', error)
    return errorResponse(res, 'Failed to send reset email')
  }
}

// @desc   Reset password
// @route  POST /api/auth/reset-password/:token
// @access Public
export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params
    const { password } = req.body
    const hashedToken = hashToken(token)

    const user = await User.findOne({
      passwordResetToken:   hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    })

    if (!user) return errorResponse(res, 'Invalid or expired reset link', 400)

    user.password             = password
    user.passwordResetToken   = undefined
    user.passwordResetExpires = undefined
    await user.save()

    const authToken = generateToken(user._id)

    return successResponse(res, { token: authToken, user: safeUser(user) }, 'Password reset successfully!')
  } catch (error) {
    console.error('Reset password error:', error)
    return errorResponse(res, 'Failed to reset password')
  }
}

// @desc   Get current user (refresh profile)
// @route  GET /api/auth/me
// @access Private
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
    if (!user) return errorResponse(res, 'User not found', 404)
    return successResponse(res, { user: safeUser(user) })
  } catch (error) {
    return errorResponse(res, 'Failed to get user profile')
  }
}
