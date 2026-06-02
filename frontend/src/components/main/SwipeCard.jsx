import React, { useState, useRef } from 'react'
import {
  IoRefreshOutline,
  IoClose,
  IoStar,
  IoHeart,
  IoWater,
} from 'react-icons/io5'

const SWIPE_THRESHOLD = 80

const SwipeCard = ({
  profile,
  onSwipeRight,   // navigate to next user
  onSwipeLeft,    // navigate to previous user
  onLike,
  onSuperLike,
  onDismiss,
  onRewind,
  isLiked,
  isSuperLiked,
  canGoBack,
  canGoForward,
}) => {
  const [drag, setDrag]             = useState({ x: 0, y: 0, dragging: false })
  const [currentPhoto, setCurrentPhoto] = useState(0)
  const [dismissed, setDismissed]   = useState(null) // 'left' | 'right' | null
  const startRef      = useRef(null)
  const isDraggingRef = useRef(false)

  const rotation    = drag.x / 20
  const nextOpacity = Math.min(Math.max(drag.x  / SWIPE_THRESHOLD, 0), 1)
  const prevOpacity = Math.min(Math.max(-drag.x / SWIPE_THRESHOLD, 0), 1)

  const commitSwipe = (dx) => {
    if (dx > SWIPE_THRESHOLD && canGoForward) {
      setDismissed('right')
      setTimeout(() => {
        setDismissed(null)
        setDrag({ x: 0, y: 0, dragging: false })
        onSwipeRight?.()
      }, 250)
    } else if (dx < -SWIPE_THRESHOLD && canGoBack) {
      setDismissed('left')
      setTimeout(() => {
        setDismissed(null)
        setDrag({ x: 0, y: 0, dragging: false })
        onSwipeLeft?.()
      }, 250)
    } else {
      setDrag({ x: 0, y: 0, dragging: false })
    }
  }

  /* ── Touch ── */
  const onTouchStart = (e) => {
    const t = e.touches[0]
    startRef.current = { x: t.clientX, y: t.clientY }
    isDraggingRef.current = false
    setDrag((d) => ({ ...d, dragging: true }))
  }
  const onTouchMove = (e) => {
    if (!startRef.current) return
    const dx = e.touches[0].clientX - startRef.current.x
    const dy = e.touches[0].clientY - startRef.current.y
    if (Math.abs(dx) > 5) isDraggingRef.current = true
    setDrag({ x: dx, y: dy, dragging: true })
  }
  const onTouchEnd = () => {
    commitSwipe(drag.x)
    isDraggingRef.current = false
  }

  /* ── Mouse ── */
  const onMouseDown = (e) => {
    startRef.current = { x: e.clientX, y: e.clientY }
    isDraggingRef.current = false
    setDrag((d) => ({ ...d, dragging: true }))

    const move = (ev) => {
      const dx = ev.clientX - startRef.current.x
      if (Math.abs(dx) > 5) isDraggingRef.current = true
      setDrag({ x: dx, y: ev.clientY - startRef.current.y, dragging: true })
    }
    const up = (ev) => {
      window.removeEventListener('mousemove', move)
      window.removeEventListener('mouseup', up)
      const dx = ev.clientX - startRef.current.x
      commitSwipe(dx)
      isDraggingRef.current = false
    }
    window.addEventListener('mousemove', move)
    window.addEventListener('mouseup', up)
  }

  const photos    = profile.photos || []
  const hasPhotos = photos.length > 0

  const handlePhotoTap = (e, direction) => {
    if (isDraggingRef.current) return
    e.stopPropagation()
    if (direction === 'prev') setCurrentPhoto((p) => Math.max(p - 1, 0))
    else setCurrentPhoto((p) => Math.min(p + 1, photos.length - 1))
  }

  const flyX = dismissed === 'right' ? 500 : dismissed === 'left' ? -500 : drag.x
  const flyY = dismissed ? 0 : drag.y

  return (
    <div
      className="absolute inset-0 rounded-3xl overflow-hidden shadow-xl select-none"
      style={{
        transform: `translate(${flyX}px, ${flyY}px) rotate(${dismissed ? (dismissed === 'right' ? 15 : -15) : rotation}deg)`,
        transition: dismissed
          ? 'transform 0.25s ease-in'
          : drag.dragging
          ? 'none'
          : 'transform 0.4s cubic-bezier(0.25,0.46,0.45,0.94)',
        cursor: 'grab',
        touchAction: 'none',
      }}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      onMouseDown={onMouseDown}
    >
      {/* ── Photo ── */}
      <div className="absolute inset-0 bg-gray-300">
        {hasPhotos ? (
          <img
            src={photos[currentPhoto]}
            alt={profile.name}
            className="w-full h-full object-cover"
            draggable={false}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary-400 to-primary-700 flex items-center justify-center">
            <span className="text-white text-7xl font-bold opacity-60">
              {(profile.name || '?')[0].toUpperCase()}
            </span>
          </div>
        )}
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(to bottom, transparent 45%, rgba(0,0,0,0.85) 100%)' }}
        />
      </div>

      {/* ── Photo dots + tap zones ── */}
      {photos.length > 1 && (
        <>
          <div
            className="absolute left-0 top-0 h-4/5 w-1/2 z-10"
            onClick={(e) => handlePhotoTap(e, 'prev')}
          />
          <div
            className="absolute right-0 top-0 h-4/5 w-1/2 z-10"
            onClick={(e) => handlePhotoTap(e, 'next')}
          />
          <div className="absolute top-3 left-0 right-0 flex justify-center gap-1.5 z-20 px-4">
            {photos.map((_, i) => (
              <div
                key={i}
                className={`h-1 rounded-full transition-all duration-300 ${
                  i === currentPhoto ? 'bg-primary-500 w-7' : 'bg-white/50 w-4'
                }`}
              />
            ))}
          </div>
        </>
      )}

      {/* ── NEXT stamp (swipe right) ── */}
      <div
        className="absolute top-14 left-6 z-20 border-4 border-green-400 rounded-xl px-4 py-1.5 rotate-[-20deg] pointer-events-none"
        style={{ opacity: canGoForward ? nextOpacity : 0 }}
      >
        <span className="text-green-400 text-3xl font-black tracking-widest">NEXT →</span>
      </div>

      {/* ── BACK stamp (swipe left) ── */}
      <div
        className="absolute top-14 right-6 z-20 border-4 border-blue-400 rounded-xl px-4 py-1.5 rotate-[20deg] pointer-events-none"
        style={{ opacity: canGoBack ? prevOpacity : 0 }}
      >
        <span className="text-blue-400 text-3xl font-black tracking-widest">← BACK</span>
      </div>

      {/* ── Name / distance ── */}
      <div className="absolute bottom-20 left-5 right-5 z-20 pointer-events-none">
        <h2 className="text-white text-3xl font-extrabold drop-shadow">
          {profile.name || 'Unknown'}{profile.age ? ` (${profile.age})` : ''}
        </h2>
        {profile.distance != null && (
          <p className="text-white/80 text-base mt-0.5">
            {profile.distance === 0 ? 'Less than 1 km away' : `${profile.distance} km away`}
          </p>
        )}
      </div>

      {/* ── Action buttons (unchanged from original) ── */}
      <div className="absolute bottom-4 left-0 right-0 flex justify-center items-center gap-4 z-20">

        {/* 🔄 Rewind */}
        <button
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => { e.stopPropagation(); onRewind?.() }}
          className="w-12 h-12 rounded-full bg-black/20 border-2 border-green-400 flex items-center justify-center
                     hover:bg-green-400/20 active:scale-90 transition-all duration-150"
        >
          <IoRefreshOutline className="text-green-400 text-xl" />
        </button>

        {/* ❌ Nope — dismisses card */}
        <button
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => { e.stopPropagation(); onDismiss?.(profile) }}
          className="w-14 h-14 rounded-full bg-black/20 border-2 border-red-400 flex items-center justify-center
                     hover:bg-red-400/20 active:scale-90 transition-all duration-150"
        >
          <IoClose className="text-red-400 text-2xl" />
        </button>

        {/* ⭐ Super Like */}
        <button
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => { e.stopPropagation(); onSuperLike?.(profile) }}
          className={`w-14 h-14 rounded-full bg-black/20 border-2 flex items-center justify-center
                      active:scale-90 transition-all duration-150 ${
                        isSuperLiked
                          ? 'border-yellow-300 bg-yellow-400/30'
                          : 'border-yellow-400 hover:bg-yellow-400/20'
                      }`}
        >
          <IoStar className="text-yellow-400 text-2xl" />
        </button>

        {/* 💜 Like */}
        <button
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => { e.stopPropagation(); onLike?.(profile) }}
          className={`w-14 h-14 rounded-full bg-black/20 border-2 flex items-center justify-center
                      active:scale-90 transition-all duration-150 ${
                        isLiked
                          ? 'border-primary-300 bg-primary-400/30'
                          : 'border-primary-400 hover:bg-primary-400/20'
                      }`}
        >
          <IoHeart className="text-primary-400 text-2xl" />
        </button>

        {/* 💧 Boost */}
        <button
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
          className="w-12 h-12 rounded-full bg-black/20 border-2 border-blue-400 flex items-center justify-center
                     hover:bg-blue-400/20 active:scale-90 transition-all duration-150"
        >
          <IoWater className="text-blue-400 text-xl" />
        </button>
      </div>
    </div>
  )
}

export default SwipeCard