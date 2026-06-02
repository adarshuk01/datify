import React, { useEffect, useCallback, useRef, useState } from 'react'
import TopBar from '../../components/main/TopBar'
import SwipeCard from '../../components/main/SwipeCard'
import Spinner from '../../components/common/Spinner'
import api from '../../services/api'
import { toast } from 'react-toastify'
import { useHomeStore } from '../../store/homeStore'
import FilterModal from '../../components/main/FilterModal'

const HomePage = () => {
  const {
    profiles, currentIndex, page, hasMore,
    liked, superLiked,
    setProfiles, setCurrentIndex, setPage, setHasMore,
    addLiked, addSuperLiked, reset,
  } = useHomeStore()

  const [loading, setLoading]       = useState(false)
  const [error, setError]           = useState(null)
  const [filterOpen, setFilterOpen] = useState(false)
  const loadingMore = useRef(false)

  const fetchProfiles = useCallback(async (pageNum = 1, resetAll = false) => {
    if (loadingMore.current && !resetAll) return
    loadingMore.current = true
    try {
      setLoading(true)
      setError(null)
      const res = await api.get(`/users/discover?page=${pageNum}&limit=10`)
      const { data, pagination } = res.data
      if (resetAll) {
        reset()
        setProfiles(data)
      } else {
        setProfiles((prev) => [...prev, ...data])
      }
      setHasMore(pageNum < pagination.pages)
      setPage(pageNum)
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to load profiles'
      setError(msg)
    } finally {
      setLoading(false)
      loadingMore.current = false
    }
  }, [reset, setProfiles, setHasMore, setPage])

  // Only fetch on first mount if we have no profiles cached
  useEffect(() => {
    if (profiles.length === 0) {
      fetchProfiles(1, true)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Pre-load more when nearing the end
  useEffect(() => {
    if (profiles.length > 0 && currentIndex >= profiles.length - 3 && hasMore && !loading) {
      fetchProfiles(page + 1, false)
    }
  }, [currentIndex, profiles.length, hasMore, loading, page, fetchProfiles])

  // After filters are saved, reset and re-fetch with new preferences applied
  const handleFilterApply = useCallback(() => {
    fetchProfiles(1, true)
  }, [fetchProfiles])

  // Swipe right → next user
  const handleSwipeRight = useCallback(() => {
    setCurrentIndex((i) => Math.min(i + 1, profiles.length - 1))
  }, [profiles.length, setCurrentIndex])

  // Swipe left → previous user
  const handleSwipeLeft = useCallback(() => {
    setCurrentIndex((i) => Math.max(i - 1, 0))
  }, [setCurrentIndex])

  // ❌ Nope — only button that removes a card
  const handleDismiss = async (profile) => {
    setProfiles((prev) => prev.filter((p) => p.id !== profile.id))
    setCurrentIndex((i) => Math.min(i, profiles.length - 2))
    try { await api.post(`/users/${profile.id}/pass`) } catch (_) {}
  }

  // 💜 Like — card stays
  const handleLike = async (profile) => {
    if (liked.has(profile.id)) return
    addLiked(profile.id)
    try {
      const res = await api.post(`/users/${profile.id}/like`)
      if (res.data?.data?.isMatch) {
        toast.success(`🎉 It's a match with ${profile.name}!`, { autoClose: 4000 })
      } else {
        toast.success(`💜 Liked ${profile.name}!`, { autoClose: 1500 })
      }
    } catch (_) {}
  }

  // ⭐ Super Like — card stays
  const handleSuperLike = async (profile) => {
    if (superLiked.has(profile.id)) return
    addSuperLiked(profile.id)
    try {
      await api.post(`/users/${profile.id}/super-like`)
      toast.success(`⭐ Super liked ${profile.name}!`, { autoClose: 2000 })
    } catch (_) {}
  }

  // 🔄 Rewind — go back one user
  const handleRewind = () => {
    setCurrentIndex((i) => Math.max(i - 1, 0))
  }

  const handleRefresh = () => {
    fetchProfiles(1, true)
  }

  const currentProfile = profiles[currentIndex] || null
  const isFirst = currentIndex === 0
  const isLast  = currentIndex >= profiles.length - 1

  return (
    <div className="flex flex-col h-full w-full bg-white">
      <TopBar
        title="Datify"
        showSearch={true}
        showNotif={true}
        showFilter={true}
        onFilterClick={() => setFilterOpen(true)}
      />

      <div className="flex-1 relative px-4 pt-3 pb-2">

        {/* Loading */}
        {loading && profiles.length === 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
            <Spinner size="lg" color="purple" />
            <p className="text-gray-400 text-sm">Finding people near you...</p>
          </div>
        )}

        {/* Error */}
        {error && profiles.length === 0 && !loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 px-8 text-center">
            <span className="text-5xl">😔</span>
            <p className="text-gray-600 font-semibold">{error}</p>
            <button
              onClick={handleRefresh}
              className="px-6 py-3 bg-primary-600 text-white rounded-full font-semibold
                         hover:bg-primary-700 transition-colors active:scale-95"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && profiles.length === 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 px-8 text-center">
            <span className="text-6xl">💜</span>
            <h3 className="text-xl font-bold text-gray-800">You've seen everyone nearby!</h3>
            <p className="text-gray-500 text-sm">Check back later or expand your distance.</p>
            <button
              onClick={handleRefresh}
              className="mt-2 px-6 py-3 bg-primary-600 text-white rounded-full font-semibold
                         hover:bg-primary-700 transition-colors active:scale-95"
            >
              Refresh
            </button>
          </div>
        )}

        {/* Card */}
        {currentProfile && (
          <div className="relative w-full" style={{ height: 'calc(100vh - 200px)' }}>
            <SwipeCard
              key={currentProfile.id}
              profile={currentProfile}
              isLiked={liked.has(currentProfile.id)}
              isSuperLiked={superLiked.has(currentProfile.id)}
              canGoBack={!isFirst}
              canGoForward={!isLast || hasMore}
              onSwipeRight={handleSwipeRight}
              onSwipeLeft={handleSwipeLeft}
              onDismiss={handleDismiss}
              onLike={handleLike}
              onSuperLike={handleSuperLike}
              onRewind={handleRewind}
            />

            {loading && profiles.length > 0 && (
              <div className="absolute bottom-24 left-0 right-0 flex justify-center">
                <Spinner size="sm" color="purple" />
              </div>
            )}
          </div>
        )}
      </div>

      <FilterModal
        isOpen={filterOpen}
        onClose={() => setFilterOpen(false)}
        onApply={handleFilterApply}
      />
    </div>
  )
}

export default HomePage
