import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { IoArrowBack, IoCloseCircle, IoPersonOutline } from 'react-icons/io5'
import { IoSearchOutline } from 'react-icons/io5'
import api from '../../services/api'
import Spinner from '../../components/common/Spinner'

const RECENT_KEY = 'datify-recent-searches'

const getRecent = () => {
  try { return JSON.parse(localStorage.getItem(RECENT_KEY) || '[]') } catch { return [] }
}
const saveRecent = (name) => {
  const prev = getRecent().filter((n) => n !== name)
  localStorage.setItem(RECENT_KEY, JSON.stringify([name, ...prev].slice(0, 10)))
}
const removeRecent = (name) => {
  localStorage.setItem(RECENT_KEY, JSON.stringify(getRecent().filter((n) => n !== name)))
}
const clearRecent = () => localStorage.removeItem(RECENT_KEY)

const SearchPage = () => {
  const navigate = useNavigate()
  const inputRef  = useRef(null)

  const [query,    setQuery]    = useState('')
  const [results,  setResults]  = useState([])
  const [loading,  setLoading]  = useState(false)
  const [recent,   setRecent]   = useState(getRecent)
  const [searched, setSearched] = useState(false)

  useEffect(() => { inputRef.current?.focus() }, [])

  const doSearch = useCallback(async (q) => {
    if (!q.trim()) { setResults([]); setSearched(false); return }
    setLoading(true)
    setSearched(true)
    try {
      const res = await api.get(`/users/search?q=${encodeURIComponent(q.trim())}`)
      setResults(res.data?.data?.users || [])
    } catch {
      setResults([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const t = setTimeout(() => doSearch(query), 400)
    return () => clearTimeout(t)
  }, [query, doSearch])

  const handleRecentClick = (name) => {
    setQuery(name)
    doSearch(name)
  }

  const handleResultClick = (user) => {
    saveRecent(user.name)
    setRecent(getRecent())
    navigate(`/profile/view/${user.id || user._id}`, {
      state: {
        profile: {
          id: user.id || user._id,
          name: user.name,
          age: user.age,
          distance: user.distance,
          photos: user.photo ? [user.photo] : [],
        },
      },
    })
  }

  const handleRemoveRecent = (e, name) => {
    e.stopPropagation()
    removeRecent(name)
    setRecent(getRecent())
  }

  const handleClearAll = () => {
    clearRecent()
    setRecent([])
  }

  const showRecent  = !query && recent.length > 0
  const showResults = searched && !loading

  return (
    /* h-screen + flex-col so the page fills exactly the phone height with no overflow */
    <div className="flex flex-col h-screen w-full bg-white overflow-hidden">
      {/* Search bar header */}
      <div className="flex items-center gap-3 px-4 pt-12 pb-3 border-b border-gray-100 flex-shrink-0">
        <button
          onClick={() => navigate(-1)}
          className="w-9 h-9 flex items-center justify-center hover:bg-gray-100 rounded-full transition-colors flex-shrink-0"
        >
          <IoArrowBack className="text-xl text-gray-700" />
        </button>

        <div className="flex-1 flex items-center gap-2 bg-gray-100 rounded-2xl px-4 py-2.5 min-w-0">
          <IoSearchOutline className="text-gray-400 text-lg flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search"
            className="flex-1 min-w-0 bg-transparent text-sm text-gray-800 placeholder-gray-400 focus:outline-none"
          />
          {query && (
            <button onClick={() => { setQuery(''); setResults([]); setSearched(false) }} className="flex-shrink-0">
              <IoCloseCircle className="text-gray-400 text-lg" />
            </button>
          )}
        </div>
      </div>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        {/* Recent Searches */}
        {showRecent && (
          <div className="px-4 pt-5">
            <div className="flex items-center justify-between mb-4">
              <span className="text-base font-bold text-gray-900">Recent Searches</span>
              <button onClick={handleClearAll}>
                <IoCloseCircle className="text-gray-400 text-xl" />
              </button>
            </div>
            <div className="h-px bg-gray-100 mb-2" />
            {recent.map((name) => (
              <div
                key={name}
                onClick={() => handleRecentClick(name)}
                className="flex items-center justify-between py-4 cursor-pointer hover:bg-gray-50 -mx-4 px-4 transition-colors"
              >
                <span className="text-sm text-gray-500">{name}</span>
                <button
                  onClick={(e) => handleRemoveRecent(e, name)}
                  className="text-gray-400 hover:text-gray-600 flex-shrink-0"
                >
                  <svg width="14" height="14" fill="none" viewBox="0 0 14 14">
                    <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex justify-center items-center py-16">
            <Spinner size="md" color="purple" />
          </div>
        )}

        {/* Results grid */}
        {showResults && results.length > 0 && (
          <div className="px-4 pt-4 pb-4">
            <div className="grid grid-cols-2 gap-3">
              {results.map((user) => (
                <UserResultCard
                  key={String(user.id || user._id)}
                  user={user}
                  onClick={() => handleResultClick(user)}
                />
              ))}
            </div>
          </div>
        )}

        {/* No results */}
        {showResults && results.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 gap-4 px-6 text-center">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
              <IoSearchOutline className="text-3xl text-gray-400" />
            </div>
            <p className="text-gray-700 font-semibold">No results for "{query}"</p>
            <p className="text-gray-400 text-sm">Try a different name</p>
          </div>
        )}
      </div>
    </div>
  )
}

const UserResultCard = ({ user, onClick }) => (
  <div
    onClick={onClick}
    className="relative rounded-3xl overflow-hidden cursor-pointer active:scale-95 transition-transform"
    style={{ paddingTop: '130%' }}
  >
    {user.photo ? (
      <img
        src={user.photo}
        alt={user.name}
        className="absolute inset-0 w-full h-full object-cover"
      />
    ) : (
      <div className="absolute inset-0 bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
        <IoPersonOutline className="text-5xl text-primary-400" />
      </div>
    )}
    {/* Gradient overlay */}
    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
    {/* Info */}
    <div className="absolute bottom-0 left-0 right-0 px-3 pb-3">
      <p className="text-white font-bold text-sm leading-tight">
        {user.name}{user.age ? ` (${user.age})` : ''}
      </p>
      {user.distance != null && (
        <p className="text-white/80 text-xs mt-0.5">{user.distance} km away</p>
      )}
    </div>
  </div>
)

export default SearchPage
