import React, { useEffect, useRef, useState, useCallback } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { IoArrowBack, IoSend, IoAdd, IoMicOutline } from 'react-icons/io5'
import { useChatStore } from '../../store/chatStore'
import { useAuthStore } from '../../store/authStore'
import Spinner from '../../components/common/Spinner'
import {
  joinConversation,
  leaveConversation,
  sendSocketMessage,
  emitTypingStart,
  emitTypingStop,
  getSocket,
} from '../../services/socketService'
import api from '../../services/api'

// ─── Time formatter ────────────────────────────────────────────────────────
const formatMsgTime = (dateStr) => {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
}

const formatDateSeparator = (dateStr) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  if (date.toDateString() === today.toDateString()) return 'Today'
  if (date.toDateString() === yesterday.toDateString()) return 'Yesterday'
  return date.toLocaleDateString([], { month: 'long', day: 'numeric', year: 'numeric' })
}

const isSameDay = (d1, d2) => {
  const a = new Date(d1)
  const b = new Date(d2)
  return a.getDate() === b.getDate() && a.getMonth() === b.getMonth() && a.getFullYear() === b.getFullYear()
}

// ─── Message bubble ────────────────────────────────────────────────────────
const MessageBubble = ({ message, isMine, showAvatar, participantPhoto, participantName }) => {
  return (
    <div className={`flex items-end gap-2 ${isMine ? 'flex-row-reverse' : 'flex-row'}`}>
      {/* Avatar for other person */}
      {!isMine && (
        <div className="w-7 h-7 rounded-full overflow-hidden flex-shrink-0 mb-1">
          {showAvatar ? (
            participantPhoto ? (
              <img src={participantPhoto} alt={participantName} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-primary-100 flex items-center justify-center">
                <span className="text-primary-600 text-xs font-bold">
                  {(participantName || 'U')[0].toUpperCase()}
                </span>
              </div>
            )
          ) : (
            <div className="w-7 h-7" />
          )}
        </div>
      )}

      {/* Bubble */}
      <div className={`max-w-[72%] ${isMine ? 'items-end' : 'items-start'} flex flex-col`}>
        <div
          className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
            isMine
              ? 'bg-primary-600 text-white rounded-br-sm'
              : 'bg-gray-100 text-gray-800 rounded-bl-sm'
          }`}
        >
          {message.text}
        </div>
        <div className={`flex items-center gap-1 mt-1 ${isMine ? 'flex-row-reverse' : ''}`}>
          <span className="text-[10px] text-gray-400">{formatMsgTime(message.createdAt)}</span>
          {isMine && (
            <span className="text-[10px] text-gray-400">
              {message.readBy?.length > 1 ? '✓✓' : '✓'}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Typing indicator ──────────────────────────────────────────────────────
const TypingIndicator = ({ participantPhoto, participantName }) => (
  <div className="flex items-end gap-2">
    <div className="w-7 h-7 rounded-full overflow-hidden flex-shrink-0">
      {participantPhoto ? (
        <img src={participantPhoto} alt={participantName} className="w-full h-full object-cover" />
      ) : (
        <div className="w-7 h-7 bg-primary-100 flex items-center justify-center rounded-full">
          <span className="text-primary-600 text-xs font-bold">
            {(participantName || 'U')[0].toUpperCase()}
          </span>
        </div>
      )}
    </div>
    <div className="bg-gray-100 px-4 py-3 rounded-2xl rounded-bl-sm flex items-center gap-1">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
          style={{ animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </div>
  </div>
)

// ─── Main ChatRoomPage ─────────────────────────────────────────────────────
const ChatRoomPage = () => {
  const { conversationId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const {
    messages,
    activeConversation,
    isLoadingMessages,
    fetchMessages,
    appendMessage,
    markAsRead,
    setActiveConversation,
    isTyping,
  } = useChatStore()

  const [text, setText] = useState('')
  const [participant, setParticipant] = useState(null)
  const [loadingConv, setLoadingConv] = useState(false)
  const messagesEndRef = useRef(null)
  const typingTimerRef = useRef(null)
  const inputRef = useRef(null)
  const myId = String(user?.id || user?._id || '')

  // ── Load conversation if not in store ────────────────────────────────────
  useEffect(() => {
    const loadConv = async () => {
      if (!activeConversation) {
        setLoadingConv(true)
        try {
          // Try fetching conversations list to find this one
          const res = await api.get('/chat/conversations')
          const convs = res.data?.data?.conversations || []
          const found = convs.find(
            (c) => String(c.id || c._id) === String(conversationId)
          )
          if (found) {
            setActiveConversation(found)
          }
        } catch (_) {}
        setLoadingConv(false)
      }
    }
    loadConv()
  }, [activeConversation, conversationId, setActiveConversation])

  // ── Set participant from conversation ────────────────────────────────────
  useEffect(() => {
    if (activeConversation?.participant) {
      setParticipant(activeConversation.participant)
    }
  }, [activeConversation])

  // ── Join socket room & fetch messages ────────────────────────────────────
  useEffect(() => {
    if (!conversationId) return
    joinConversation(conversationId)
    fetchMessages(conversationId)
    markAsRead(conversationId)

    return () => {
      leaveConversation(conversationId)
    }
  }, [conversationId, fetchMessages, markAsRead])

  // ── Listen for new messages via socket ───────────────────────────────────
  useEffect(() => {
    const socket = getSocket()
    if (!socket) return

    const handleNewMsg = (message) => {
      if (String(message.conversationId) === String(conversationId)) {
        appendMessage(message)
        markAsRead(conversationId)
      }
    }

    socket.on('new:message', handleNewMsg)
    return () => socket.off('new:message', handleNewMsg)
  }, [conversationId, appendMessage, markAsRead])

  // ── Auto scroll to bottom ────────────────────────────────────────────────
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // ── Send message ─────────────────────────────────────────────────────────
  const handleSend = useCallback(async () => {
    const trimmed = text.trim()
    if (!trimmed || !conversationId) return

    setText('')
    emitTypingStop(conversationId)

    const socketSent = sendSocketMessage(conversationId, trimmed)

    // Optimistic update (socket will echo back)
    if (!socketSent) {
      // Fallback: REST
      try {
        const res = await api.post(`/chat/conversations/${conversationId}/messages`, { text: trimmed })
        const msg = res.data?.data?.message
        if (msg) appendMessage(msg)
      } catch (err) {
        console.error('Send message REST error:', err)
      }
    }
  }, [text, conversationId, appendMessage])

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  // ── Typing indicators ─────────────────────────────────────────────────────
  const handleTextChange = (e) => {
    setText(e.target.value)
    if (e.target.value) {
      emitTypingStart(conversationId)
      clearTimeout(typingTimerRef.current)
      typingTimerRef.current = setTimeout(() => emitTypingStop(conversationId), 2000)
    } else {
      emitTypingStop(conversationId)
    }
  }

  // ── Build message groups with date separators ─────────────────────────────
  const renderMessages = () => {
    const items = []
    for (let i = 0; i < messages.length; i++) {
      const msg = messages[i]
      const prev = messages[i - 1]
      const next = messages[i + 1]
      const isMine = String(msg.sender) === myId

      // Date separator
      if (!prev || !isSameDay(prev.createdAt, msg.createdAt)) {
        items.push(
          <div key={`sep-${msg._id}`} className="flex justify-center my-4">
            <span className="text-xs text-gray-500 bg-gray-100 rounded-full px-3 py-1">
              {formatDateSeparator(msg.createdAt)}
            </span>
          </div>
        )
      }

      // Show avatar only on last message in a consecutive group from other person
      const isLastInGroup =
        !next || String(next.sender) !== String(msg.sender) || !isSameDay(next.createdAt, msg.createdAt)
      const showAvatar = !isMine && isLastInGroup

      items.push(
        <MessageBubble
          key={String(msg._id)}
          message={msg}
          isMine={isMine}
          showAvatar={showAvatar}
          participantPhoto={participant?.photo}
          participantName={participant?.name}
        />
      )
    }
    return items
  }

  const convTyping = isTyping(conversationId)

  if (loadingConv && !participant) {
    return (
      <div className="flex flex-col min-h-screen bg-white items-center justify-center">
        <Spinner size="md" color="purple" />
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-12 pb-3 bg-white border-b border-gray-100 flex-shrink-0">
        <button
          onClick={() => navigate('/main/chats')}
          className="w-9 h-9 flex items-center justify-center hover:bg-gray-100 rounded-full transition-colors"
        >
          <IoArrowBack className="text-xl text-gray-700" />
        </button>

        {/* Name + avatar */}
        <button
          onClick={() => {
            if (participant?.id) navigate(`/profile/view/${participant.id}`)
          }}
          className="flex flex-col items-center active:scale-95 transition-transform"
        >
          <span className="text-base font-bold text-gray-900">{participant?.name || 'Chat'}</span>
        </button>

        {/* Spacer for symmetry */}
        <div className="w-9 h-9" />
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2 bg-white">
        {isLoadingMessages ? (
          <div className="flex justify-center items-center h-32">
            <Spinner size="sm" color="purple" />
          </div>
        ) : (
          <>
            {renderMessages()}
            {convTyping && (
              <TypingIndicator
                participantPhoto={participant?.photo}
                participantName={participant?.name}
              />
            )}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input bar */}
      <div className="flex-shrink-0 bg-white border-t border-gray-100 px-4 py-3 pb-safe flex items-center gap-3">
        {/* Plus button */}
        <button className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-700 transition-colors">
          <IoAdd className="text-2xl" />
        </button>

        {/* Text input */}
        <div className="flex-1 bg-gray-50 rounded-full flex items-center px-4 py-2.5 min-h-[44px]">
          <input
            ref={inputRef}
            type="text"
            value={text}
            onChange={handleTextChange}
            onKeyDown={handleKeyDown}
            placeholder="Send message ..."
            className="flex-1 bg-transparent text-sm text-gray-800 placeholder-gray-400 outline-none"
          />
          {/* Mic icon when empty */}
          {!text && (
            <button className="text-gray-400 hover:text-gray-600 transition-colors ml-2">
              <IoMicOutline className="text-xl" />
            </button>
          )}
        </div>

        {/* Send button */}
        <button
          onClick={handleSend}
          disabled={!text.trim()}
          className={`w-11 h-11 rounded-full flex items-center justify-center shadow-md transition-all duration-200 ${
            text.trim()
              ? 'bg-primary-600 text-white active:scale-90 hover:bg-primary-700'
              : 'bg-primary-200 text-white cursor-not-allowed'
          }`}
        >
          <IoSend className="text-base ml-0.5" />
        </button>
      </div>
    </div>
  )
}

export default ChatRoomPage
