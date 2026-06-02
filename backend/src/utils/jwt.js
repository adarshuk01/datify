import jwt from 'jsonwebtoken'
import crypto from 'crypto'

export const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  })
}

export const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET)
}

export const generateEmailToken = () => {
  return crypto.randomBytes(32).toString('hex')
}

export const hashToken = (token) => {
  return crypto.createHash('sha256').update(token).digest('hex')
}
