import { verifyToken } from '../utils/jwt.js'
import User from '../models/User.js'
import { errorResponse } from '../utils/response.js'

export const protect = async (req, res, next) => {
  try {
    let token

    if (req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1]
    }

    if (!token) {
      return errorResponse(res, 'Authentication required. Please log in.', 401)
    }

    const decoded = verifyToken(token)
    const user = await User.findById(decoded.id).select('-password')

    if (!user) {
      return errorResponse(res, 'User not found. Please log in again.', 401)
    }

    if (!user.isActive) {
      return errorResponse(res, 'Your account has been deactivated.', 403)
    }

    req.user = user
    next()
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return errorResponse(res, 'Invalid token. Please log in again.', 401)
    }
    if (error.name === 'TokenExpiredError') {
      return errorResponse(res, 'Token expired. Please log in again.', 401)
    }
    return errorResponse(res, 'Authentication failed', 401)
  }
}

export const requireEmailVerification = (req, res, next) => {
  if (!req.user.isEmailVerified) {
    return errorResponse(res, 'Please verify your email to access this feature', 403)
  }
  next()
}

export const requirePremium = (req, res, next) => {
  if (!req.user.isPremium) {
    return errorResponse(res, 'This feature requires a premium subscription', 403)
  }
  next()
}
