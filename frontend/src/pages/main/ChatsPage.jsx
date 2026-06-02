import React, { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { IoChatbubbleEllipsesOutline } from 'react-icons/io5'
import TopBar from '../../components/main/TopBar'
import { useChatStore } from '../../store/chatStore'
import { useAuthStore } from '../../store/authStore'
import Spinner from '../../components/common/Spinner'

// ─── Helpers ───────────────────────────────────────────────────────────────
const formatTime = (dateStr) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  const now = new Date()
  const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24))
  if (diffDays === 0) return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return date.toLocaleDateString([], { weekday: 'short' })
  return date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })
}

const isRecentlyActive = (lastActive) => {
  if (!lastActive) return false
  return Date.now() - new Date(lastActive).getTime() < 5 * 60 * 1000
}

// ─── Now Active bubble (matches with no messages yet OR recently active) ───
const ActiveBubble = ({ conversation, onClick }) => {
  const { participant } = conversation
  const active = isRecentlyActive(participant?.lastActive)

  return (
    <button
      type="button"
      onClick={() => onClick(conversation)}
      className="flex flex-col items-center flex-shrink-0 w-[72px] active:scale-95 transition-transform duration-150"
    >
      <div className="relative">
        <div className="w-[60px] h-[60px] rounded-full overflow-hidden border-[2.5px] border-primary-200 bg-gray-100">
          {participant?.photo ? (
            <img src={participant.photo} alt={participant.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-primary-100">
              <span className="text-primary-600 text-lg font-bold">
                {(participant?.name || 'U')[0].toUpperCase()}
              </span>
            </div>
          )}
        </div>
        {active && (
          <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-primary-500 rounded-full border-2 border-white" />
        )}
      </div>
      <span className="text-[11px] text-gray-600 font-medium mt-1.5 truncate w-full text-center leading-tight">
        {(participant?.name || 'User').split(' ')[0]}
      </span>
    </button>
  )
}

// ─── Conversation row (matches that have at least one message) ─────────────
const ConversationRow = ({ conversation, myId, onClick }) => {
  const { participant, lastMessage, unreadCount, lastMessageAt } = conversation
  const hasUnread = unreadCount > 0
  const active = isRecentlyActive(participant?.lastActive)

  const preview = lastMessage
    ? lastMessage.sender === myId
      ? `You: ${lastMessage.text}`
      : lastMessage.text
    : 'Tap to say hello! 👋'

  const truncated = preview.length > 40 ? preview.slice(0, 40) + '…' : preview

  return (
    <button
      type="button"
      onClick={() => onClick(conversation)}
      className="flex items-center w-full px-5 py-[14px] hover:bg-gray-50 active:bg-gray-100 transition-colors duration-150"
    >
      {/* Avatar */}
      <div className="relative flex-shrink-0">
        <div className="w-[54px] h-[54px] rounded-full overflow-hidden bg-gray-200">
          {participant?.photo ? (
            <img src={participant.photo} alt={participant.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-primary-100">
              <span className="text-primary-600 text-xl font-bold">
                {(participant?.name || 'U')[0].toUpperCase()}
              </span>
            </div>
          )}
        </div>
        {active && (
          <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-primary-500 rounded-full border-2 border-white" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 ml-3.5">
        <div className="flex items-center justify-between mb-0.5">
          <span className={`text-[15px] truncate ${hasUnread ? 'font-bold text-gray-900' : 'font-semibold text-gray-800'}`}>
            {participant?.name || 'Unknown'}
          </span>
          <span className={`text-[11px] flex-shrink-0 ml-2 ${hasUnread ? 'text-primary-600 font-semibold' : 'text-gray-400'}`}>
            {formatTime(lastMessageAt || conversation.createdAt)}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className={`text-[13px] truncate ${hasUnread ? 'text-gray-700 font-medium' : 'text-gray-500'}`}>
            {truncated}
          </span>
          {hasUnread > 0 && (
            <span className="ml-2 flex-shrink-0 min-w-[20px] h-5 rounded-full bg-primary-600 text-white text-[10px] flex items-center justify-center font-bold px-1.5">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </div>
      </div>
    </button>
  )
}

// ─── Main ChatsPage ────────────────────────────────────────────────────────
const ChatsPage = () => {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const {
    conversations,
    isLoadingConversations,
    fetchConversations,
    setActiveConversation,
  } = useChatStore()

  // Always re-fetch when this page mounts so new mutual matches appear
  const hasFetched = useRef(false)
  useEffect(() => {
    if (!hasFetched.current) {
      hasFetched.current = true
    }
    fetchConversations()
  }, [fetchConversations])

  const handleClick = (conversation) => {
    setActiveConversation(conversation)
    navigate(`/chat/${conversation.id || conversation._id}`)
  }

  const myId = String(user?.id || user?._id || '')

  // Split: new matches (no messages yet) go to "Now Active" row;
  // Conversations with messages go to the list below.
  const newMatches = conversations.filter((c) => !c.lastMessage)
  const activeChats = conversations.filter((c) => !!c.lastMessage)

  const showNewMatchesRow = newMatches.length > 0

  return (
    <div className="flex flex-col h-full w-full bg-white">
      <TopBar title="Chats" showSearch={true} onSearchClick={() => navigate('/search')} />

      {/* Loading */}
      {isLoadingConversations && (
        <div className="flex justify-center items-center py-12">
          <Spinner size="md" color="purple" />
        </div>
      )}

      {!isLoadingConversations && (
        <>
          {conversations.length === 0 ? (
            /* ── Empty state ── */
            <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
              <div className="w-24 h-24 rounded-full bg-primary-50 flex items-center justify-center mb-6">
                <IoChatbubbleEllipsesOutline className="text-5xl text-primary-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">No chats yet</h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                Like someone and when they like you back,<br />they'll appear here to chat!
              </p>
              <button
                onClick={() => navigate('/main/home')}
                className="mt-6 px-6 py-3 rounded-full bg-primary-600 text-white text-sm font-semibold shadow-md active:scale-95 transition-all"
              >
                Discover People
              </button>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto">

              {/* ── New Matches row ── */}
              {showNewMatchesRow && (
                <>
                  <div className="px-5 pt-5 pb-4">
                    <div className="flex items-center justify-between mb-3.5">
                      <span className="text-[15px] font-bold text-gray-900">Now Active</span>
                      <span className="text-xs text-primary-600 font-semibold bg-primary-50 px-2 py-0.5 rounded-full">
                        {newMatches.length} new
                      </span>
                    </div>
                    <div className="flex gap-3 overflow-x-auto pb-0.5">
                      {newMatches.map((conv) => (
                        <ActiveBubble
                          key={String(conv.id || conv._id)}
                          conversation={conv}
                          onClick={handleClick}
                        />
                      ))}
                    </div>
                  </div>
                  {activeChats.length > 0 && <div className="h-px bg-gray-100" />}
                </>
              )}

              {/* ── Conversation list ── */}
              {activeChats.length > 0 && (
                <div className="divide-y divide-gray-50">
                  {activeChats.map((conv) => (
                    <ConversationRow
                      key={String(conv.id || conv._id)}
                      conversation={conv}
                      myId={myId}
                      onClick={handleClick}
                    />
                  ))}
                </div>
              )}

              {/* When only new matches (no messages yet), show a hint below */}
              {showNewMatchesRow && activeChats.length === 0 && (
                <div className="px-5 pt-2 pb-4">
                  <p className="text-xs text-gray-400 text-center">
                    Tap a match above to start your first conversation
                  </p>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default ChatsPage
