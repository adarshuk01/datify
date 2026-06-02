import mongoose from 'mongoose'

// A Conversation is always between exactly two matched users.
const conversationSchema = new mongoose.Schema(
  {
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
    ],
    lastMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Message',
      default: null,
    },
    lastMessageAt: {
      type: Date,
      default: null,
    },
    // unreadCount per participant: { userId: count }
    unreadCounts: {
      type: Map,
      of: Number,
      default: {},
    },
  },
  {
    timestamps: true,
  }
)

// Ensure exactly 2 participants and index for quick lookup
conversationSchema.index({ participants: 1 })
conversationSchema.index({ lastMessageAt: -1 })

const Conversation = mongoose.model('Conversation', conversationSchema)
export default Conversation
