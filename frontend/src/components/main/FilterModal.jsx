import React, { useState, useEffect } from 'react'
import { IoClose } from 'react-icons/io5'
import api from '../../services/api'
import Spinner from '../common/Spinner'

/* ─── Constants ──────────────────────────────────────────────────────── */

const ALL_INTERESTS = [
  'Travel', 'Sports', 'Music', 'Reading', 'Movies', 'Cooking',
  'Photography', 'Pets', 'Fashion', 'Foodie', 'Gaming', 'Art',
  'Yoga', 'Fitness', 'Dancing', 'Hiking', 'Coffee', 'Tech',
]

const RELATIONSHIP_GOALS = [
  { label: 'Dating',              emoji: '💛', value: 'dating' },
  { label: 'Friendship',          emoji: '🙌', value: 'friendship' },
  { label: 'Casual',              emoji: '😀', value: 'casual' },
  { label: 'Serious Relationship',emoji: '💍', value: 'serious' },
  { label: 'Networking',          emoji: '🤝', value: 'networking' },
  { label: 'Open to Options',     emoji: '🌟', value: 'open' },
  { label: 'Exploration',         emoji: '🌍', value: 'exploration' },
]

const PHOTO_OPTIONS = [1, 2, 3, 4, 5, 6]

const DEFAULT_FILTERS = {
  distanceRange: 200,
  ageMin: 20,
  ageMax: 35,
  minPhotos: 1,
  showMe: 'women',
  relationshipGoals: [],
  hasBio: false,
  interests: [],
}

/* ─── Slider ─────────────────────────────────────────────────────────── */

const Slider = ({ value, min, max, onChange, color = '#7c3aed' }) => {
  const pct = ((value - min) / (max - min)) * 100
  return (
    <div className="relative h-5 flex items-center">
      <div className="relative w-full h-1.5 rounded-full bg-gray-200">
        <div
          className="absolute left-0 h-full rounded-full"
          style={{ width: `${pct}%`, background: 'linear-gradient(90deg, #7c3aed, #a855f7)' }}
        />
        <input
          type="range"
          min={min}
          max={max}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="absolute inset-0 w-full opacity-0 cursor-pointer h-full"
        />
        <div
          className="absolute top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-primary-600 shadow-md border-2 border-white"
          style={{ left: `calc(${pct}% - 10px)` }}
        />
      </div>
    </div>
  )
}

/* ─── Range Slider ───────────────────────────────────────────────────── */

const RangeSlider = ({ min, max, valueMin, valueMax, onMinChange, onMaxChange }) => {
  const pctMin = ((valueMin - min) / (max - min)) * 100
  const pctMax = ((valueMax - min) / (max - min)) * 100

  return (
    <div className="relative h-5 flex items-center mt-1">
      <div className="relative w-full h-1.5 rounded-full bg-gray-200">
        {/* Active range */}
        <div
          className="absolute h-full rounded-full"
          style={{
            left: `${pctMin}%`,
            width: `${pctMax - pctMin}%`,
            background: 'linear-gradient(90deg, #7c3aed, #a855f7)',
          }}
        />
        {/* Min thumb */}
        <input
          type="range" min={min} max={max} value={valueMin}
          onChange={(e) => {
            const v = Number(e.target.value)
            if (v < valueMax) onMinChange(v)
          }}
          className="absolute inset-0 w-full opacity-0 cursor-pointer h-full z-10"
        />
        <div
          className="absolute top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-white border-2 border-primary-600 shadow-md z-20 pointer-events-none"
          style={{ left: `calc(${pctMin}% - 10px)` }}
        />
        {/* Max thumb */}
        <input
          type="range" min={min} max={max} value={valueMax}
          onChange={(e) => {
            const v = Number(e.target.value)
            if (v > valueMin) onMaxChange(v)
          }}
          className="absolute inset-0 w-full opacity-0 cursor-pointer h-full z-10"
        />
        <div
          className="absolute top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-white border-2 border-primary-600 shadow-md z-20 pointer-events-none"
          style={{ left: `calc(${pctMax}% - 10px)` }}
        />
      </div>
    </div>
  )
}

/* ─── Main Component ─────────────────────────────────────────────────── */

const FilterModal = ({ isOpen, onClose, onApply }) => {
  const [filters, setFilters]   = useState(DEFAULT_FILTERS)
  const [loading, setLoading]   = useState(false)
  const [saving,  setSaving]    = useState(false)
  const [showAllInterests, setShowAllInterests] = useState(false)

  // Load saved filters from backend
  useEffect(() => {
    if (!isOpen) return
    const fetchFilters = async () => {
      setLoading(true)
      try {
        const res = await api.get('/users/filters')
        const f = res.data?.data?.filters
        if (f) setFilters({ ...DEFAULT_FILTERS, ...f })
      } catch (err) {
        // silent — use defaults
      } finally {
        setLoading(false)
      }
    }
    fetchFilters()
  }, [isOpen])

  if (!isOpen) return null

  const update = (key, val) => setFilters((prev) => ({ ...prev, [key]: val }))

  const toggleGoal = (val) => {
    setFilters((prev) => {
      const cur = prev.relationshipGoals || []
      return {
        ...prev,
        relationshipGoals: cur.includes(val) ? cur.filter((g) => g !== val) : [...cur, val],
      }
    })
  }

  const toggleInterest = (tag) => {
    setFilters((prev) => {
      const cur = prev.interests || []
      return {
        ...prev,
        interests: cur.includes(tag) ? cur.filter((t) => t !== tag) : [...cur, tag],
      }
    })
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await api.put('/users/filters', { filters })
      onApply?.(filters)
      onClose()
    } catch (err) {
      console.error('Save filters error:', err)
    } finally {
      setSaving(false)
    }
  }

  const visibleInterests = showAllInterests ? ALL_INTERESTS : ALL_INTERESTS.slice(0, 6)

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 z-40 backdrop-blur-[2px]"
        onClick={onClose}
      />

      {/* Sheet */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-sm bg-white rounded-t-3xl z-50 flex flex-col"
           style={{ maxHeight: '92vh' }}>

        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-gray-200" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
          <button onClick={onClose} className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100">
            <IoClose className="text-xl text-gray-600" />
          </button>
          <h2 className="text-base font-bold text-gray-900">Filter &amp; Show</h2>
          <div className="w-9" />
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto flex-1 px-5 py-4 space-y-6">
          {loading ? (
            <div className="flex justify-center py-16"><Spinner size="md" color="purple" /></div>
          ) : (
            <>
              {/* Distance Range */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-bold text-gray-900">Distance Range</span>
                  <span className="text-sm text-gray-500 font-medium">{filters.distanceRange} km</span>
                </div>
                <Slider
                  value={filters.distanceRange}
                  min={5}
                  max={500}
                  onChange={(v) => update('distanceRange', v)}
                />
              </div>

              <div className="h-px bg-gray-100" />

              {/* Age Range */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-bold text-gray-900">Age Range</span>
                  <span className="text-sm text-gray-500 font-medium">{filters.ageMin} – {filters.ageMax}</span>
                </div>
                <RangeSlider
                  min={18}
                  max={80}
                  valueMin={filters.ageMin}
                  valueMax={filters.ageMax}
                  onMinChange={(v) => update('ageMin', v)}
                  onMaxChange={(v) => update('ageMax', v)}
                />
              </div>

              <div className="h-px bg-gray-100" />

              {/* Minimum Photos */}
              <div>
                <span className="text-sm font-bold text-gray-900 block mb-3">Minimum Number of Photos</span>
                <div className="flex gap-2">
                  {PHOTO_OPTIONS.map((n) => (
                    <button
                      key={n}
                      onClick={() => update('minPhotos', n)}
                      className={`w-10 h-10 rounded-full text-sm font-semibold transition-all
                        ${filters.minPhotos === n
                          ? 'bg-primary-600 text-white shadow-md'
                          : 'border border-gray-200 text-gray-600 hover:border-primary-400'
                        }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>

              <div className="h-px bg-gray-100" />

              {/* Show Me */}
              <div>
                <span className="text-sm font-bold text-gray-900 block mb-3">Show Me</span>
                <div className="flex flex-col gap-3">
                  {['men', 'women', 'everyone'].map((g) => (
                    <label key={g} className="flex items-center gap-3 cursor-pointer">
                      <div
                        onClick={() => update('showMe', g)}
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all
                          ${filters.showMe === g ? 'border-primary-600' : 'border-gray-300'}`}
                      >
                        {filters.showMe === g && (
                          <div className="w-2.5 h-2.5 rounded-full bg-primary-600" />
                        )}
                      </div>
                      <span className="text-sm text-gray-700 capitalize">{g === 'everyone' ? 'Everyone' : g.charAt(0).toUpperCase() + g.slice(1)}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="h-px bg-gray-100" />

              {/* Relationship Goals */}
              <div>
                <span className="text-sm font-bold text-gray-900 block mb-3">Relationship Goals</span>
                <div className="flex flex-wrap gap-2">
                  {RELATIONSHIP_GOALS.map(({ label, emoji, value }) => {
                    const active = (filters.relationshipGoals || []).includes(value)
                    return (
                      <button
                        key={value}
                        onClick={() => toggleGoal(value)}
                        className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all
                          ${active
                            ? 'bg-primary-600 text-white shadow-md'
                            : 'border border-gray-200 text-gray-700 hover:border-primary-400'
                          }`}
                      >
                        {label} {emoji}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="h-px bg-gray-100" />

              {/* Has Bio */}
              <div className="flex items-center gap-3">
                <div
                  onClick={() => update('hasBio', !filters.hasBio)}
                  className={`w-6 h-6 rounded-md border-2 flex items-center justify-center flex-shrink-0 cursor-pointer transition-all
                    ${filters.hasBio ? 'bg-primary-600 border-primary-600' : 'border-gray-300'}`}
                >
                  {filters.hasBio && (
                    <svg viewBox="0 0 12 10" className="w-3.5 h-3.5" fill="none">
                      <path d="M1 5l3 3.5L11 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </div>
                <span className="text-sm font-bold text-gray-900">Has a Bio</span>
              </div>

              <div className="h-px bg-gray-100" />

              {/* Interests */}
              <div>
                <span className="text-sm font-bold text-gray-900 block mb-3">Interests</span>
                <div className="flex flex-wrap gap-2">
                  {visibleInterests.map((tag) => {
                    const active = (filters.interests || []).includes(tag)
                    return (
                      <button
                        key={tag}
                        onClick={() => toggleInterest(tag)}
                        className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all
                          ${active
                            ? 'bg-primary-600 text-white shadow-md'
                            : 'border border-gray-200 text-gray-700 hover:border-primary-400'
                          }`}
                      >
                        {tag}
                      </button>
                    )
                  })}
                </div>
                {!showAllInterests && ALL_INTERESTS.length > 6 && (
                  <button
                    onClick={() => setShowAllInterests(true)}
                    className="mt-3 text-sm font-semibold text-primary-600"
                  >
                    See all interests
                  </button>
                )}
              </div>

              {/* Bottom padding */}
              <div className="h-4" />
            </>
          )}
        </div>

        {/* Save Button */}
        <div className="px-5 py-4 border-t border-gray-100 bg-white">
          <button
            onClick={handleSave}
            disabled={saving || loading}
            className="w-full py-3.5 rounded-2xl bg-primary-600 text-white font-bold text-sm shadow-lg active:scale-95 transition-transform flex items-center justify-center gap-2"
          >
            {saving ? <Spinner size="sm" color="white" /> : null}
            {saving ? 'Saving...' : 'Show Results'}
          </button>
        </div>
      </div>
    </>
  )
}

export default FilterModal
