import React from 'react'
import { IoLocationOutline } from 'react-icons/io5'

const MatchCard = ({ profile, onClick, badge }) => {
  const photo = profile.photos?.[0]
  const distanceKm = profile.distance

  // Format distance: show "< 1 km" for 0, "X km away" otherwise
  const distanceLabel =
    distanceKm === null || distanceKm === undefined
      ? null
      : distanceKm === 0
      ? '< 1 km away'
      : `${distanceKm} km away`

  return (
    <button
      type="button"
      onClick={() => onClick?.(profile)}
      className="relative rounded-2xl overflow-hidden bg-gray-200 active:scale-95
                 transition-transform duration-150 focus:outline-none w-full shadow-sm"
      style={{ paddingTop: '130%' }}
    >
      {/* Photo */}
      {photo ? (
        <img
          src={photo}
          alt={profile.name}
          className="absolute inset-0 w-full h-full object-cover"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-primary-300 to-primary-600 flex items-center justify-center">
          <span className="text-white text-4xl font-bold">{(profile.name || '?')[0]}</span>
        </div>
      )}

      {/* Gradient overlay */}
      <div
        className="absolute inset-0"
        style={{ background: 'linear-gradient(to bottom, transparent 45%, rgba(0,0,0,0.80) 100%)' }}
      />

      {/* Badge (⭐ for super likes) */}
      {badge && (
        <div className="absolute top-2 right-2 w-7 h-7 bg-yellow-400 rounded-full flex items-center justify-center shadow-md text-sm">
          {badge}
        </div>
      )}

      {/* Info */}
      <div className="absolute bottom-0 left-0 right-0 p-3">
        <p className="text-white font-bold text-sm leading-tight">
          {profile.name}{profile.age ? ` (${profile.age})` : ''}
        </p>
        {distanceLabel && (
          <div className="flex items-center gap-1 mt-0.5">
            <IoLocationOutline className="text-white/70 text-xs flex-shrink-0" />
            <p className="text-white/75 text-xs">{distanceLabel}</p>
          </div>
        )}
      </div>
    </button>
  )
}

export default MatchCard
