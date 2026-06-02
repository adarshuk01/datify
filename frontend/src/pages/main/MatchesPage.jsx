import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import TopBar from '../../components/main/TopBar'
import MatchCard from '../../components/main/MatchCard'
import FilterModal from '../../components/main/FilterModal'
import Spinner from '../../components/common/Spinner'
import api from '../../services/api'

const MatchesPage = () => {
  const navigate = useNavigate()
  const [activeTab, setActiveTab]   = useState('likes')
  const [likes, setLikes]           = useState([])
  const [superLikes, setSuperLikes] = useState([])
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState(null)
  const [filterOpen, setFilterOpen] = useState(false)

  const fetchMatches = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res  = await api.get('/users/matches')
      const data = res.data?.data || {}
      setLikes(data.likes       || [])
      setSuperLikes(data.superLikes || [])
    } catch (err) {
      console.error('Fetch matches error:', err)
      setError('Failed to load matches')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchMatches() }, [fetchMatches])

  const handleCardClick = (profile) => {
    navigate(`/profile/view/${profile.id || profile._id}`, { state: { profile } })
  }

  const profiles = activeTab === 'likes' ? likes : superLikes

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <TopBar
        title="Matches"
        showSearch={true}
        showFilter={true}
        onSearchClick={() => navigate('/search')}
        onFilterClick={() => setFilterOpen(true)}
      />

      {/* Tab switcher */}
      <div className="flex mx-4 mt-4 mb-3 rounded-full overflow-hidden bg-gray-100 p-1 gap-1">
        <button
          onClick={() => setActiveTab('likes')}
          className={`flex-1 py-2.5 rounded-full text-sm font-semibold transition-all duration-200
            ${activeTab === 'likes' ? 'bg-primary-600 text-white shadow-md' : 'text-gray-500 hover:text-gray-700'}`}
        >
          Likes ({likes.length})
        </button>
        <button
          onClick={() => setActiveTab('superlikes')}
          className={`flex-1 py-2.5 rounded-full text-sm font-semibold transition-all duration-200
            ${activeTab === 'superlikes' ? 'bg-primary-600 text-white shadow-md' : 'text-gray-500 hover:text-gray-700'}`}
        >
          Super Likes ({superLikes.length})
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-4">
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <Spinner size="md" color="purple" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-60 gap-3 text-center px-6">
            <span className="text-4xl">😔</span>
            <p className="text-gray-500 text-sm">{error}</p>
          </div>
        ) : profiles.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-60 gap-3 text-center px-6">
            <span className="text-5xl">{activeTab === 'likes' ? '💜' : '⭐'}</span>
            <p className="text-gray-700 font-semibold text-base">
              {activeTab === 'likes' ? 'No mutual likes yet' : 'No super likes yet'}
            </p>
            <p className="text-gray-400 text-sm">
              {activeTab === 'likes'
                ? 'When someone likes you back, they appear here.'
                : 'Tap ⭐ on a profile to super like them!'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {profiles.map((profile) => (
              <MatchCard
                key={String(profile.id || profile._id)}
                profile={profile}
                badge={activeTab === 'superlikes' ? '⭐' : null}
                onClick={handleCardClick}
              />
            ))}
          </div>
        )}
      </div>

      <FilterModal
        isOpen={filterOpen}
        onClose={() => setFilterOpen(false)}
        onApply={fetchMatches}
      />
    </div>
  )
}

export default MatchesPage
