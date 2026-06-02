import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import dotenv from 'dotenv'
import { connectDB } from './config/database.js'
import authRoutes from './routes/authRoutes.js'
import userRoutes from './routes/userRoutes.js'
import chatRoutes from './routes/chatRoutes.js'
import { initSocket } from './config/socket.js'
import { errorHandler, notFound } from './middleware/errorMiddleware.js'
import { apiLimiter } from './middleware/rateLimiter.js'

dotenv.config()

const app = express()
const httpServer = createServer(app)
const PORT = process.env.PORT || 5000

const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173'

// Socket.IO server
const io = new Server(httpServer, {
  cors: {
    origin: CLIENT_URL,
    credentials: true,
    methods: ['GET', 'POST'],
  },
  pingTimeout: 60000,
  pingInterval: 25000,
})

// Connect to MongoDB
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

// Request logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'))
}

// Rate limiting
app.use('/api', apiLimiter)

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'OK', environment: process.env.NODE_ENV, timestamp: new Date().toISOString() })
})

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/users', userRoutes)
app.use('/api/chat', chatRoutes)

// 404 & Error handlers
app.use(notFound)
app.use(errorHandler)

// Init Socket.IO
initSocket(io)

httpServer.listen(PORT, () => {
  console.log(`🚀 Datify API running on port ${PORT} in ${process.env.NODE_ENV} mode`)
  console.log(`🔌 Socket.IO enabled`)
})

export default app
