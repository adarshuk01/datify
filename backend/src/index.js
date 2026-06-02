import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import dotenv from 'dotenv'

import { connectDB } from './config/database.js'
import authRoutes from './routes/authRoutes.js'
import userRoutes from './routes/userRoutes.js'
import chatRoutes from './routes/chatRoutes.js'
import ablyRoutes from './routes/ablyRoutes.js'
import {
  errorHandler,
  notFound,
} from './middleware/errorMiddleware.js'
import { apiLimiter } from './middleware/rateLimiter.js'

dotenv.config()

const app = express()

const PORT = process.env.PORT || 5000
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173'

// Connect MongoDB
connectDB()

// Security middleware
app.use(helmet())

// CORS
app.use(
  cors({
    origin: CLIENT_URL,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
)

// Body parsing
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'))
}

// Rate limiter
app.use('/api', apiLimiter)

// Health check
app.get('/health', (_req, res) => {
  res.json({
    status: 'OK',
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
  })
})

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/users', userRoutes)
app.use('/api/chat', chatRoutes)
app.use('/api/ably', ablyRoutes)   // ← Ably token auth + typing indicators

// 404
app.use(notFound)

// Error handler
app.use(errorHandler)

// Local dev only (Vercel runs the exported app directly)
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`🚀 Datify API running on port ${PORT}`)
    console.log(`🔌 Ably token endpoint → POST /api/ably/token`)
  })
}

export default app
