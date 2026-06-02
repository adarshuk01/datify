import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import {
  IoArrowBack, IoLocationOutline, IoMaleOutline,
  IoSchoolOutline, IoBriefcaseOutline,
  IoHeart, IoHeartOutline, IoStarOutline, IoStar, IoClose,
} from 'react-icons/io5'
import { MdHeight } from 'react-icons/md'
import { FaFacebook, FaInstagram, FaTiktok, FaTwitter, FaLinkedin } from 'react-icons/fa'
import api from '../../services/api'
import Spinner from '../../components/common/Spinner'

/* ─── Interest emoji map — keys are clean names (no emoji) ─────────────── */
const INTEREST_EMOJI = {
  Travel: '✈️', Photography: '📸', Pets: '🐶', Fashion: '👗', Foodie: '🍽️',
  Sports: '🏀', Music: '🎵', Reading: '📚', Movies: '🎬', Cooking: '🍳',
  Gaming: '🎮', Art: '🎨', Yoga: '🧘', Fitness: '💪', Dancing: '💃',
  Hiking: '🥾', Coffee: '☕', Tech: '💻', Technology: '📱', Science: '🔬',
  Books: '📚', Nature: '🌿',
}

/* Strip any trailing emoji from a stored interest string */
const cleanInterestName = (raw) =>
  raw.replace(/[\u{1F300}-\u{1FFFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\s]+$/u, '').trim()

/* ─── Info row — plain list style, icon left + text, no chip background ── */
const InfoRow = ({ icon: Icon, label, emoji }) => {
  if (!label) return null
  return (
    <div className="flex items-center gap-3 py-1.5">
      {emoji ? (
        <span className="text-[18px] w-5 flex-shrink-0 flex items-center justify-center leading-none">
          {emoji}
        </span>
      ) : (
        <Icon className="text-gray-400 flex-shrink-0" style={{ fontSize: 18, minWidth: 20 }} />
      )}
      <span className="text-sm text-gray-700">{label}</span>
    </div>
  )
}

/* ─── Section heading ─────────────────────────────────────────────────── */
const SectionTitle = ({ children }) => (
  <h2 className="text-base font-bold text-gray-900 mb-3">{children}</h2>
)

/* ─── Photo gallery — swipe + tap zones + dot indicator ─────────────── */
const PhotoGallery = ({ photos, name }) => {
  const [idx, setIdx] = useState(0)
  const touchStart = useRef(null)
  const touchEnd   = useRef(null)
  const SWIPE_MIN  = 50

  const prev = useCallback(() => setIdx((i) => Math.max(0, i - 1)), [])
  const next = useCallback(() => setIdx((i) => Math.min(photos.length - 1, i + 1)), [photos.length])

  const onTouchStart = (e) => { touchStart.current = e.changedTouches[0].clientX; touchEnd.current = null }
  const onTouchMove  = (e) => { touchEnd.current = e.changedTouches[0].clientX }
  const onTouchEnd   = () => {
    if (touchStart.current === null || touchEnd.current === null) return
    const delta = touchStart.current - touchEnd.current
    if (delta >  SWIPE_MIN) next()
    if (delta < -SWIPE_MIN) prev()
    touchStart.current = null; touchEnd.current = null
  }

  if (!photos.length) {
    return (
      <div className="w-full h-full bg-gradient-to-br from-primary-300 to-primary-600 flex items-center justify-center">
        <span className="text-white font-bold text-7xl opacity-60 select-none">{name?.[0] ?? '?'}</span>
      </div>
    )
  }

  return (
    <div className="relative w-full h-full select-none overflow-hidden"
      onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}
    >
      <img key={idx} src={photos[idx]} alt={`${name} photo ${idx + 1}`}
        className="absolute inset-0 w-full h-full object-cover object-top"
        draggable={false}
      />
      {photos.length > 1 && (
        <>
          <button aria-label="Previous" className="absolute inset-y-0 left-0 w-1/3 z-10 focus:outline-none" onClick={prev} />
          <button aria-label="Next"     className="absolute inset-y-0 right-0 w-1/3 z-10 focus:outline-none" onClick={next} />
        </>
      )}
      {photos.length > 1 && (
        <div className="absolute top-3 left-0 right-0 flex justify-center gap-1 z-20 pointer-events-none px-4">
          {photos.map((_, i) => (
            <div key={i} className={`h-1 rounded-full flex-shrink-0 transition-all duration-200 ${
              i === idx ? 'bg-white w-5' : 'bg-white/50 w-1.5'
            }`} />
          ))}
        </div>
      )}
    </div>
  )
}

/* ─── Skeleton loader ─────────────────────────────────────────────────── */
const SkeletonPulse = ({ className }) => (
  <div className={`bg-gray-200 rounded-xl animate-pulse ${className}`} />
)

const ProfileSkeleton = () => (
  <div className="flex flex-col h-screen bg-white">
    <SkeletonPulse className="w-full rounded-none" style={{ height: '62vh' }} />
    <div className="px-5 pt-6 space-y-3">
      <SkeletonPulse className="h-7 w-48" />
      <SkeletonPulse className="h-4 w-32" />
      <div className="grid grid-cols-2 gap-3 pt-2">
        <SkeletonPulse className="h-11" /><SkeletonPulse className="h-11" />
        <SkeletonPulse className="h-11" /><SkeletonPulse className="h-11" />
      </div>
    </div>
  </div>
)

/* ═══════════════════════════════════════════════════════════════════════ */
/*  Main ViewProfilePage                                                  */
/* ═══════════════════════════════════════════════════════════════════════ */
const ViewProfilePage = () => {
  const navigate   = useNavigate()
  const { userId } = useParams()
  const location   = useLocation()

  const [profile, setProfile]   = useState(location.state?.profile ?? null)
  const [loading, setLoading]   = useState(true)
  const [error,   setError]     = useState(null)

  const scrollRef  = useRef(null)
  const [scrollY, setScrollY] = useState(0)

  const [liked,            setLiked]            = useState(false)
  const [superLiked,       setSuperLiked]        = useState(false)
  const [passed,           setPassed]            = useState(false)
  const [likeLoading,      setLikeLoading]       = useState(false)
  const [superLikeLoading, setSuperLikeLoading]  = useState(false)
  const [passLoading,      setPassLoading]        = useState(false)
  const [matchToast,       setMatchToast]         = useState(false)

  /* ─── Fetch profile ─── */
  useEffect(() => {
    if (!userId) return
    setLoading(true)
    setError(null)
    api.get(`/users/${userId}/profile`)
      .then((res) => {
        const raw = res.data?.data
        const user = raw?.user ?? raw ?? null
        if (user) setProfile(user)
        else setError('Profile not found')
      })
      .catch((err) => {
        console.error('Fetch profile:', err)
        if (!profile) setError('Could not load profile')
      })
      .finally(() => setLoading(false))
  }, [userId]) // eslint-disable-line

  const handleScroll = useCallback((e) => { setScrollY(e.currentTarget.scrollTop) }, [])
  const overlapAmount = Math.min(scrollY, 56)

  /* ─── Actions ─── */
  const handleLike = async () => {
    if (liked || likeLoading) return
    setLikeLoading(true)
    try {
      const res = await api.post(`/users/${userId}/like`)
      setLiked(true)
      if (res.data?.data?.isMatch) {
        setMatchToast(true)
        setTimeout(() => setMatchToast(false), 3000)
      }
    } catch (err) {
      const msg = err.response?.data?.message || ''
      if (err.response?.status === 400 && msg.toLowerCase().includes('already')) setLiked(true)
      else console.error('Like error:', err)
    } finally { setLikeLoading(false) }
  }

  const handleSuperLike = async () => {
    if (superLiked || superLikeLoading) return
    setSuperLikeLoading(true)
    try {
      await api.post(`/users/${userId}/super-like`)
      setSuperLiked(true)
    } catch (err) {
      const msg = err.response?.data?.message || ''
      if (err.response?.status === 400 && msg.toLowerCase().includes('already')) setSuperLiked(true)
      else console.error('Super like error:', err)
    } finally { setSuperLikeLoading(false) }
  }

  const handlePass = async () => {
    if (passed || passLoading) return
    setPassLoading(true)
    try {
      await api.post(`/users/${userId}/pass`)
      setPassed(true)
    } catch (err) {
      console.error('Pass error:', err)
    } finally { setPassLoading(false) }
    navigate(-1)
  }

  /* ─── Loading / error ─── */
  if (loading && !profile) return <ProfileSkeleton />
  if (error && !profile) {
    return (
      <div className="flex flex-col h-screen bg-white items-center justify-center gap-4 px-8 text-center">
        <span className="text-5xl">😔</span>
        <p className="text-gray-600 text-sm">{error}</p>
        <button onClick={() => navigate(-1)}
          className="mt-2 px-6 py-2.5 rounded-full bg-primary-600 text-white text-sm font-semibold">
          Go Back
        </button>
      </div>
    )
  }

  /* ─── Derived display values ─── */
  const photos  = (profile?.photos ?? []).map((p) => (typeof p === 'string' ? p : p?.url)).filter(Boolean)
  const name    = profile?.name || 'Unknown'
  const age     = profile?.age  || null
  const bio     = profile?.bio  || null

  const genderRaw = profile?.gender || null
  const genderLabel =
    genderRaw === 'male'         ? 'Man'
    : genderRaw === 'female'     ? 'Woman'
    : genderRaw === 'non-binary' ? 'Non-binary'
    : genderRaw || null

  const pronouns   = profile?.pronouns || null
  const height     = profile?.height || null
  const weight     = profile?.weight || null
  const jobTitle   = profile?.jobTitle || null
  const company    = profile?.company  || null
  const school     = profile?.school   || null
  const city       = profile?.location?.city || null
  const distanceKm = profile?.distance ?? null
  const relGoal    = profile?.relationshipGoal || null

  const rawInterests = profile?.interests || []
  const socialMedia  = profile?.socialMedia || {}

  const interests = rawInterests.map(cleanInterestName).filter(Boolean)

  const distanceLabel =
    distanceKm === null ? null
    : distanceKm === 0  ? '< 1 km away'
    : `${distanceKm} km away`

  const workLabel = [jobTitle, company].filter(Boolean).join(' at ') || null
  const hasSocial = Object.values(socialMedia).some(Boolean)

  // Info rows — plain list, no chip background
  const infoRows = [
    genderLabel   && { icon: IoMaleOutline,      label: [genderLabel, pronouns].filter(Boolean).join(' (') + (pronouns ? ')' : '') },
    (height || weight) && { icon: MdHeight,      label: [height, weight].filter(Boolean).join(', ') },
    workLabel     && { icon: IoBriefcaseOutline, label: workLabel },
    school        && { icon: IoSchoolOutline,    label: school },
    city          && { icon: IoLocationOutline,  label: `Live in ${city}` },
    distanceLabel && { icon: IoLocationOutline,  label: distanceLabel },
    relGoal       && { icon: null, emoji: '💡',  label:
      relGoal === 'serious'     ? 'Looking for a serious relationship'
      : relGoal === 'casual'    ? 'Open to something casual'
      : relGoal === 'dating'    ? 'Open to dating'
      : relGoal === 'friendship'? 'Looking for friendship'
      : relGoal.charAt(0).toUpperCase() + relGoal.slice(1)
    },
  ].filter(Boolean)

  return (
    <div ref={scrollRef} className="relative h-screen w-full overflow-y-auto bg-gray-50"
      onScroll={handleScroll} style={{ WebkitOverflowScrolling: 'touch' }}
    >

      {/* ── It's a Match toast ─────────────────────────────────────────── */}
      {matchToast && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-[100] bg-primary-600 text-white px-6 py-3 rounded-full shadow-xl text-sm font-bold flex items-center gap-2 animate-bounce">
          <IoHeart className="text-lg" /> It's a Match! 🎉
        </div>
      )}

      {/* ══ STICKY PHOTO ══════════════════════════════════════════════ */}
      <div className="sticky top-0 z-0 overflow-hidden" style={{ height: '62vh' }}>
        <PhotoGallery photos={photos} name={name} />

        {/* Gradients */}
        <div className="absolute inset-0 pointer-events-none" style={{
          background: [
            'linear-gradient(to bottom, rgba(0,0,0,0.38) 0%, transparent 26%)',
            'linear-gradient(to top, rgba(0,0,0,0.70) 0%, transparent 45%)',
          ].join(', '),
        }} />

        {/* Back btn */}
        <button onClick={() => navigate(-1)}
          className="absolute top-12 left-4 z-30 w-10 h-10 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center active:scale-90 transition-transform"
        >
          <IoArrowBack className="text-white text-xl" />
        </button>

        {/* Name/distance on photo */}
        <div className="absolute bottom-6 left-5 right-5 z-20 pointer-events-none transition-opacity duration-150"
          style={{ opacity: Math.max(0, 1 - overlapAmount / 40) }}
        >
          <h1 className="text-white text-[26px] font-extrabold drop-shadow-lg leading-tight">
            {name}{age ? `, ${age}` : ''}
          </h1>
          {distanceLabel && (
            <div className="flex items-center gap-1.5 mt-1.5">
              <IoLocationOutline className="text-white/80 text-sm" />
              <span className="text-white/80 text-sm font-medium">{distanceLabel}</span>
            </div>
          )}
        </div>
      </div>

      {/* ══ DETAILS CARD ══════════════════════════════════════════════ */}
      <div className="relative z-10 bg-white min-h-screen"
        style={{
          marginTop: `-${overlapAmount}px`,
          borderRadius: '28px 28px 0 0',
          boxShadow: `0 -${Math.round(overlapAmount * 0.4)}px ${overlapAmount * 1.2}px rgba(0,0,0,${(overlapAmount / 56 * 0.15).toFixed(2)})`,
        }}
      >
        {/* Drag pill */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1.5 rounded-full bg-gray-200" />
        </div>

        {/* ── Info rows — plain list, no chip background ── */}
        {infoRows.length > 0 && (
          <div className="px-5 pt-2 pb-1 space-y-0.5">
            {infoRows.map((row, i) => (
              <InfoRow key={i} icon={row.icon} label={row.label} emoji={row.emoji} />
            ))}
          </div>
        )}

        {/* ── Bio ── */}
        {bio && (
          <>
            <div className="mx-5 mt-5 h-px bg-gray-100" />
            <div className="px-5 pt-5">
              <SectionTitle>About Me</SectionTitle>
              <p className="text-sm text-gray-600 leading-relaxed">{bio}</p>
            </div>
          </>
        )}

        {/* ── Interests — white pills, border-gray-200, text then emoji ── */}
        {interests.length > 0 && (
          <>
            <div className="mx-5 mt-5 h-px bg-gray-100" />
            <div className="px-5 pt-5">
              <SectionTitle>Interests</SectionTitle>
              <div className="flex flex-wrap gap-2">
                {interests.map((tag) => {
                  const emoji = INTEREST_EMOJI[tag]
                  return (
                    <span key={tag}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-white border border-gray-200 text-sm text-gray-800 font-normal"
                    >
                      {tag}
                      {emoji && <span aria-hidden="true">{emoji}</span>}
                    </span>
                  )
                })}
              </div>
            </div>
          </>
        )}

        {/* ── Social Media — large flat colored circular icons ── */}
        {hasSocial && (
          <>
            <div className="mx-5 mt-5 h-px bg-gray-100" />
            <div className="px-5 pt-5">
              <SectionTitle>Social Media</SectionTitle>
              <div className="flex gap-5 items-center">
                {socialMedia.facebook  && (
                  <a href={socialMedia.facebook}  target="_blank" rel="noopener noreferrer"
                    className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center active:scale-90 transition-transform">
                    <FaFacebook className="text-white text-xl" />
                  </a>
                )}
                {socialMedia.instagram && (
                  <a href={socialMedia.instagram} target="_blank" rel="noopener noreferrer"
                    className="w-12 h-12 rounded-full flex items-center justify-center active:scale-90 transition-transform"
                    style={{ background: 'radial-gradient(circle at 30% 107%, #fdf497 0%, #fdf497 5%, #fd5949 45%, #d6249f 60%, #285AEB 90%)' }}>
                    <FaInstagram className="text-white text-xl" />
                  </a>
                )}
                {socialMedia.tiktok    && (
                  <a href={socialMedia.tiktok}    target="_blank" rel="noopener noreferrer"
                    className="w-12 h-12 rounded-full bg-black flex items-center justify-center active:scale-90 transition-transform">
                    <FaTiktok className="text-white text-xl" />
                  </a>
                )}
                {socialMedia.twitter   && (
                  <a href={socialMedia.twitter}   target="_blank" rel="noopener noreferrer"
                    className="w-12 h-12 rounded-full bg-sky-500 flex items-center justify-center active:scale-90 transition-transform">
                    <FaTwitter className="text-white text-xl" />
                  </a>
                )}
                {socialMedia.linkedin  && (
                  <a href={socialMedia.linkedin}  target="_blank" rel="noopener noreferrer"
                    className="w-12 h-12 rounded-full bg-blue-700 flex items-center justify-center active:scale-90 transition-transform">
                    <FaLinkedin className="text-white text-xl" />
                  </a>
                )}
              </div>
            </div>
          </>
        )}

        {/* ── Empty state ── */}
        {infoRows.length === 0 && !bio && interests.length === 0 && !hasSocial && (
          <div className="px-5 pt-8 pb-4 text-center">
            <p className="text-gray-400 text-sm">This user hasn't filled in their profile yet.</p>
          </div>
        )}

        <div className="h-32" />
      </div>

      {/* ══ FIXED ACTION BAR ══════════════════════════════════════════ */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 z-50 w-full max-w-sm bg-white/95 backdrop-blur-md border-t border-gray-100"
        style={{ boxShadow: '0 -4px 24px rgba(0,0,0,0.07)' }}
      >
        <div className="flex items-center justify-around px-8 py-4">

          {/* Pass */}
          <button onClick={handlePass} disabled={passLoading || passed} aria-label="Pass"
            className="w-14 h-14 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center shadow-md active:scale-90 transition-all disabled:opacity-40"
          >
            {passLoading
              ? <Spinner size="sm" color="gray" />
              : <IoClose className={`text-2xl ${passed ? 'text-gray-300' : 'text-gray-400'}`} />
            }
          </button>

          {/* Super Like */}
          <button onClick={handleSuperLike} disabled={superLikeLoading || superLiked} aria-label="Super Like"
            className={`w-14 h-14 rounded-full flex items-center justify-center shadow-md active:scale-90 transition-all disabled:opacity-50 ${
              superLiked ? 'bg-yellow-400 border-2 border-yellow-400' : 'bg-white border-2 border-yellow-300'
            }`}
          >
            {superLikeLoading ? <Spinner size="sm" color="white" />
              : superLiked ? <IoStar className="text-white text-2xl" />
              : <IoStarOutline className="text-yellow-500 text-2xl" />
            }
          </button>

          {/* Like */}
          <button onClick={handleLike} disabled={likeLoading || liked} aria-label="Like"
            className={`w-14 h-14 rounded-full flex items-center justify-center shadow-md active:scale-90 transition-all disabled:opacity-50 ${
              liked ? 'bg-primary-500' : 'bg-primary-600'
            }`}
            style={liked ? { boxShadow: '0 0 0 6px rgba(124,30,232,0.15)' } : {}}
          >
            {likeLoading ? <Spinner size="sm" color="white" />
              : liked ? <IoHeart className="text-white text-2xl" />
              : <IoHeartOutline className="text-white text-2xl" />
            }
          </button>
        </div>
      </div>
    </div>
  )
}

export default ViewProfilePage
