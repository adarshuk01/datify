import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  IoLogOutOutline, IoPersonOutline,
  IoLocationOutline, IoMaleOutline, IoCreateOutline,
  IoSchoolOutline, IoBriefcaseOutline,
} from 'react-icons/io5'
import { FaStar, FaFacebook, FaInstagram, FaTiktok, FaTwitter, FaLinkedin } from 'react-icons/fa'
import { MdHeight } from 'react-icons/md'
import TopBar from '../../components/main/TopBar'
import { useAuthStore } from '../../store/authStore'

const FLAG_MAP = {
  English:  '🇺🇸',
  Chinese:  '🇨🇳',
  Spanish:  '🇪🇸',
  French:   '🇫🇷',
  German:   '🇩🇪',
  Japanese: '🇯🇵',
  Korean:   '🇰🇷',
  Arabic:   '🇸🇦',
  Hindi:    '🇮🇳',
  Portuguese: '🇧🇷',
}

const SocialIcon = ({ platform, url }) => {
  if (!url) return null
  const icons = {
    facebook:  { Icon: FaFacebook,  cls: 'text-blue-600',   bg: 'bg-blue-50' },
    instagram: { Icon: FaInstagram, cls: 'text-pink-500',   bg: 'bg-pink-50' },
    tiktok:    { Icon: FaTiktok,    cls: 'text-gray-900',   bg: 'bg-gray-100' },
    twitter:   { Icon: FaTwitter,   cls: 'text-blue-400',   bg: 'bg-blue-50' },
    linkedin:  { Icon: FaLinkedin,  cls: 'text-blue-700',   bg: 'bg-blue-50' },
  }
  const cfg = icons[platform]
  if (!cfg) return null
  const { Icon, cls, bg } = cfg
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={`w-10 h-10 rounded-full flex items-center justify-center ${bg} transition-transform active:scale-90`}
    >
      <Icon className={`text-xl ${cls}`} />
    </a>
  )
}

const InfoRow = ({ icon: Icon, label }) => {
  if (!label) return null
  return (
    <div className="flex items-center gap-2 text-sm text-gray-600">
      <Icon className="text-gray-400 text-base flex-shrink-0" />
      <span>{label}</span>
    </div>
  )
}

const ProfilePage = () => {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()
  const [showBanner, setShowBanner] = useState(true)
  const [currentPhoto, setCurrentPhoto] = useState(0)

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  const avatar     = user?.photos?.length > 0 ? user.photos[currentPhoto]?.url : user?.primaryPhoto?.url
  const name       = user?.name || user?.email?.split('@')[0] || 'User'
  const completion = user?.profileCompletion || 15

  const genderLabel = (() => {
    if (!user?.gender) return null
    const g = user.gender.charAt(0).toUpperCase() + user.gender.slice(1)
    const p = user.pronouns ? ` (${user.pronouns})` : ''
    return g + p
  })()

  const locationLabel = user?.location?.city
    ? user.location.city + (user.location.country ? `, ${user.location.country}` : '')
    : user?.location?.coordinates?.length === 2 ? 'Location set' : null

  const heightWeight = [user?.height, user?.weight].filter(Boolean).join(', ')
  const workLabel    = [user?.jobTitle, user?.company].filter(Boolean).join(' at ')
  const schoolLabel  = user?.school || null

  const INTERESTS = user?.interests || []
  const LANGUAGES = user?.languages || []
  const GOAL      = user?.relationshipGoal
    ? user.relationshipGoal.charAt(0).toUpperCase() + user.relationshipGoal.slice(1)
    : null

  const sm = user?.socialMedia || {}
  const hasSocials = Object.values(sm).some(Boolean)

  const photos = user?.photos || []

  return (
    <div className="flex flex-col h-full w-full bg-white">
      {/* Common TopBar */}
      <TopBar
        title="Profile"
        showUpgrade={true}
        showSettings={true}
      />

      <div className="flex-1 overflow-y-auto pb-4">
        {/* Profile completion banner */}
        {showBanner && completion < 100 && (
          <div className="mx-4 mt-4 bg-primary-600 rounded-2xl p-4 flex items-center gap-3 relative">
            <div className="w-12 h-12 rounded-full border-2 border-white/40 flex items-center justify-center flex-shrink-0 relative">
              <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 48 48">
                <circle cx="24" cy="24" r="20" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="4"/>
                <circle cx="24" cy="24" r="20" fill="none" stroke="white" strokeWidth="4"
                  strokeDasharray={`${(completion/100)*125.6} 125.6`} strokeLinecap="round"/>
              </svg>
              <span className="text-white text-xs font-bold relative z-10">{completion}%</span>
            </div>
            <div className="flex-1">
              <p className="text-white font-bold text-sm">Your profile is complete!</p>
              <p className="text-white/70 text-xs mt-0.5">
                Enjoy the best experience of dating and better matches!
              </p>
            </div>
            <button
              onClick={() => setShowBanner(false)}
              className="text-white/60 hover:text-white text-xl font-bold leading-none absolute top-3 right-4"
            >✕</button>
          </div>
        )}

        {/* Photo with dots */}
        <div className="mx-4 mt-4 relative rounded-3xl overflow-hidden bg-gray-100"
          style={{ aspectRatio: '4/5', maxHeight: 380 }}>
          {avatar ? (
            <img src={avatar} alt={name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
              <IoPersonOutline className="text-6xl text-primary-400" />
            </div>
          )}
          {/* Photo indicator dots */}
          {photos.length > 1 && (
            <div className="absolute top-3 left-0 right-0 flex justify-center gap-1.5 px-4">
              {photos.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPhoto(i)}
                  className={`h-1 rounded-full transition-all ${i === currentPhoto ? 'w-6 bg-white' : 'w-2 bg-white/50'}`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Name + Edit */}
        <div className="px-5 mt-5 flex items-start justify-between">
          <div className="flex-1">
            <h2 className="text-2xl font-extrabold text-gray-900">
              {name}{user?.age ? ` (${user.age})` : ''}
            </h2>
            <div className="flex flex-col gap-1.5 mt-2">
              <InfoRow icon={IoMaleOutline}    label={genderLabel} />
              {heightWeight && <InfoRow icon={MdHeight}            label={heightWeight} />}
              {workLabel    && <InfoRow icon={IoBriefcaseOutline}  label={workLabel} />}
              {schoolLabel  && <InfoRow icon={IoSchoolOutline}     label={schoolLabel} />}
              <InfoRow icon={IoLocationOutline} label={locationLabel} />
            </div>
          </div>
          <button
            onClick={() => navigate('/edit-profile')}
            className="w-12 h-12 rounded-full bg-primary-600 flex items-center justify-center
                       shadow-lg shadow-primary-200 active:scale-90 transition-transform ml-3 flex-shrink-0"
          >
            <IoCreateOutline className="text-white text-xl" />
          </button>
        </div>

        {/* About Me */}
        {user?.bio && (
          <>
            <div className="mx-5 mt-5 h-px bg-gray-100" />
            <div className="px-5 mt-5">
              <h3 className="text-sm font-bold text-gray-900 mb-2">About Me</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{user.bio}</p>
            </div>
          </>
        )}

        {/* Interests */}
        {INTERESTS.length > 0 && (
          <>
            <div className="mx-5 mt-5 h-px bg-gray-100" />
            <div className="px-5 mt-5">
              <h3 className="text-sm font-bold text-gray-900 mb-3">Interests</h3>
              <div className="flex flex-wrap gap-2">
                {INTERESTS.map((interest) => (
                  <span key={interest}
                    className="px-4 py-2 rounded-full border border-gray-200 text-gray-700 text-sm font-medium bg-white">
                    {interest}
                  </span>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Social Media */}
        {hasSocials && (
          <>
            <div className="mx-5 mt-5 h-px bg-gray-100" />
            <div className="px-5 mt-5">
              <h3 className="text-sm font-bold text-gray-900 mb-3">Social Media</h3>
              <div className="flex items-center gap-3">
                {['facebook','instagram','tiktok','twitter','linkedin'].map((p) => (
                  <SocialIcon key={p} platform={p} url={sm[p]} />
                ))}
              </div>
            </div>
          </>
        )}

        {/* Languages */}
        {LANGUAGES.length > 0 && (
          <>
            <div className="mx-5 mt-5 h-px bg-gray-100" />
            <div className="px-5 mt-5">
              <h3 className="text-sm font-bold text-gray-900 mb-3">Languages I Know</h3>
              <div className="flex flex-wrap gap-2">
                {LANGUAGES.map((lang) => (
                  <span key={lang}
                    className="px-3.5 py-2 rounded-full border border-gray-200 text-gray-700 text-sm font-medium bg-white flex items-center gap-1.5">
                    <span className="text-base">🔤</span>
                    {lang} {FLAG_MAP[lang] || ''}
                  </span>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Relationship Goals */}
        {GOAL && (
          <>
            <div className="mx-5 mt-5 h-px bg-gray-100" />
            <div className="px-5 mt-5">
              <h3 className="text-sm font-bold text-gray-900 mb-3">Relationship Goals</h3>
              <span className="px-4 py-2 rounded-full border border-gray-200 text-gray-700 text-sm font-medium">
                {GOAL} 💕
              </span>
            </div>
          </>
        )}

        {/* Stats */}
        <div className="mx-5 mt-5 h-px bg-gray-100" />
        <div className="mx-5 mt-5 grid grid-cols-3 gap-3">
          {[
            { label: 'Likes',   value: '85' },
            { label: 'Matches', value: '12' },
            { label: 'Views',   value: '240' },
          ].map(({ label, value }) => (
            <div key={label} className="bg-gray-50 rounded-2xl py-4 text-center">
              <p className="text-xl font-extrabold text-primary-600">{value}</p>
              <p className="text-xs text-gray-400 font-medium mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        {/* Logout */}
        <div className="mx-4 mt-6">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-4 rounded-2xl border-2 border-red-100
                       text-red-500 font-semibold hover:bg-red-50 transition-colors active:scale-95"
          >
            <IoLogOutOutline className="text-xl" />
            Log out
          </button>
        </div>
      </div>
    </div>
  )
}

export default ProfilePage
