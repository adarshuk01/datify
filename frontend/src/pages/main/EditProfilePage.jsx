import React, { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { IoArrowBack, IoAddOutline, IoCloseCircle } from 'react-icons/io5'
import { FaFacebook, FaInstagram, FaTiktok, FaTwitter, FaLinkedin } from 'react-icons/fa'
import { toast } from 'react-toastify'
import api from '../../services/api'
import { useAuthStore } from '../../store/authStore'
import Spinner from '../../components/common/Spinner'

// Each entry: { name: stored value, emoji: display only }
const INTERESTS_LIST = [
  { name: 'Travel',       emoji: '✈️' },
  { name: 'Movies',       emoji: '🎬' },
  { name: 'Art',          emoji: '🎨' },
  { name: 'Technology',   emoji: '📱' },
  { name: 'Science',      emoji: '🔬' },
  { name: 'Music',        emoji: '🎵' },
  { name: 'Sports',       emoji: '🏀' },
  { name: 'Cooking',      emoji: '🍳' },
  { name: 'Photography',  emoji: '📸' },
  { name: 'Gaming',       emoji: '🎮' },
  { name: 'Books',        emoji: '📚' },
  { name: 'Fitness',      emoji: '💪' },
  { name: 'Fashion',      emoji: '👗' },
  { name: 'Nature',       emoji: '🌿' },
  { name: 'Yoga',         emoji: '🧘' },
  { name: 'Dancing',      emoji: '💃' },
  { name: 'Coffee',       emoji: '☕' },
  { name: 'Hiking',       emoji: '🥾' },
  { name: 'Pets',         emoji: '🐶' },
  { name: 'Foodie',       emoji: '🍽️' },
]

const LANGUAGES_LIST = [
  'Malayalam',
  'English',
  'Hindi',
  'Tamil',
  'Kannada',
  'Telugu',
  'Bengali',
  'Marathi',
  'Gujarati',
  'Punjabi',
];

const PRONOUNS  = ['He/Him', 'She/Her', 'They/Them', 'Other']
const GENDERS   = ['Man', 'Woman', 'Non-binary', 'Other']
const RELATIONSHIP_GOALS = ['Dating', 'Friendship', 'Casual', 'Serious']

// Height options in cm (150–210)
const HEIGHTS_CM = Array.from({ length: 61 }, (_, i) => `${150 + i} cm`)
// Weight options kg (40–150)
const WEIGHTS_KG = Array.from({ length: 111 }, (_, i) => `${40 + i} kg`)

const FieldRow = ({ label, children }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{label}</label>
    {children}
  </div>
)

const TextInput = ({ value, onChange, placeholder, maxLength, type = 'text' }) => (
  <input
    type={type}
    value={value}
    onChange={(e) => onChange(e.target.value)}
    placeholder={placeholder}
    maxLength={maxLength}
    className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3.5 text-base
               text-gray-800 placeholder-gray-400 focus:outline-none focus:border-primary-400
               focus:bg-white transition-all"
  />
)

const SelectInput = ({ value, onChange, options, placeholder }) => (
  <div className="relative">
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3.5 text-base
                 text-gray-800 focus:outline-none focus:border-primary-400 focus:bg-white
                 transition-all appearance-none pr-10"
    >
      <option value="">{placeholder}</option>
      {options.map((o) => (
        <option key={o} value={o}>{o}</option>
      ))}
    </select>
    <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
      <svg width="12" height="8" fill="none" viewBox="0 0 12 8">
        <path d="M1 1l5 5 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    </div>
  </div>
)

const EditProfilePage = () => {
  const navigate = useNavigate()
  const { user, updateUser, refreshUser } = useAuthStore()
  const inputRef = useRef()
  const [saving, setSaving] = useState(false)

  // Photos
  const [photos, setPhotos] = useState([])

  // Core fields
  const [nickname, setNickname]     = useState(user?.name     || '')
  const [birthday, setBirthday]     = useState(user?.birthday || '')
  const [gender,   setGender]       = useState(() => {
    if (!user?.gender) return ''
    const m = { male:'Man', female:'Woman', 'non-binary':'Non-binary', other:'Other', 'prefer-not-to-say':'Other' }
    return m[user.gender] || ''
  })
  const [pronouns, setPronouns]     = useState(user?.pronouns || '')
  const [height,   setHeight]       = useState(user?.height   || '')
  const [weight,   setWeight]       = useState(user?.weight   || '')
  const [jobTitle, setJobTitle]     = useState(user?.jobTitle || '')
  const [company,  setCompany]      = useState(user?.company  || '')
  const [school,   setSchool]       = useState(user?.school   || '')
  const [livingIn, setLivingIn]     = useState(user?.location?.city || '')
  const [aboutMe,  setAboutMe]      = useState(user?.bio      || '')
  const [interests, setInterests]   = useState(user?.interests || [])
  const [languages, setLanguages]   = useState(user?.languages || [])
  const [relationshipGoal, setRelationshipGoal] = useState(() => {
    if (!user?.relationshipGoal) return ''
    return user.relationshipGoal.charAt(0).toUpperCase() + user.relationshipGoal.slice(1)
  })
  const [socials, setSocials] = useState({
    facebook:  user?.socialMedia?.facebook  || '',
    instagram: user?.socialMedia?.instagram || '',
    tiktok:    user?.socialMedia?.tiktok    || '',
    twitter:   user?.socialMedia?.twitter   || '',
    linkedin:  user?.socialMedia?.linkedin  || '',
  })

  // Seed photos from user.photos
  useEffect(() => {
    if (user?.photos?.length > 0) {
      setPhotos(user.photos.map((p) => ({
        preview:  p.url,
        url:      p.url,
        publicId: p.publicId,
        _id:      p._id,
      })))
    }
  }, [user])

  const handleFileChange = async (e) => {
    const file = e.target.files[0]
    if (!file || photos.length >= 6) return
    const preview = URL.createObjectURL(file)
    const tempPhoto = { preview, file, uploading: true }
    setPhotos((prev) => [...prev, tempPhoto])
    e.target.value = ''

    try {
      const formData = new FormData()
      formData.append('photo', file)
      const res = await api.post('/users/photos', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      const uploaded = res.data?.data?.photos?.slice(-1)[0]
      setPhotos((prev) =>
        prev.map((p) =>
          p.preview === preview
            ? { preview: uploaded?.url || preview, url: uploaded?.url, publicId: uploaded?.publicId, _id: uploaded?._id, uploading: false }
            : p
        )
      )
      toast.success('Photo uploaded!')
    } catch {
      setPhotos((prev) => prev.filter((p) => p.preview !== preview))
      URL.revokeObjectURL(preview)
      toast.error('Photo upload failed')
    }
  }

  const handleRemovePhoto = async (idx) => {
    const photo = photos[idx]
    if (photo._id) {
      try {
        await api.delete(`/users/photos/${photo._id}`)
        toast.success('Photo removed')
      } catch {
        toast.error('Failed to remove photo')
        return
      }
    }
    if (photo.preview && photo.file) URL.revokeObjectURL(photo.preview)
    setPhotos((prev) => prev.filter((_, i) => i !== idx))
  }

  const toggleInterest = (name) => {
    if (interests.includes(name)) {
      setInterests(interests.filter((i) => i !== name))
    } else if (interests.length < 5) {
      setInterests([...interests, name])
    }
  }

  const toggleLanguage = (lang) => {
    if (languages.includes(lang)) {
      setLanguages(languages.filter((l) => l !== lang))
    } else {
      setLanguages([...languages, lang])
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const genderMap = { Man: 'male', Woman: 'female', 'Non-binary': 'non-binary', Other: 'other' }
      const goalMap   = { Dating: 'dating', Friendship: 'friendship', Casual: 'casual', Serious: 'serious' }

      // Compute age from birthday if set
      let age = user?.age
      if (birthday) {
        const dob  = new Date(birthday)
        const diff = Date.now() - dob.getTime()
        const calc = Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25))
        if (calc >= 18 && calc <= 100) age = calc
      }

      const payload = {
        name:             nickname || undefined,
        bio:              aboutMe  || undefined,
        birthday:         birthday || undefined,
        age:              age      || undefined,
        gender:           genderMap[gender] || undefined,
        pronouns:         pronouns || undefined,
        height:           height   || undefined,
        weight:           weight   || undefined,
        jobTitle:         jobTitle || undefined,
        company:          company  || undefined,
        school:           school   || undefined,
        interests,
        languages,
        relationshipGoal: goalMap[relationshipGoal] || undefined,
        socialMedia: {
          facebook:  socials.facebook  || '',
          instagram: socials.instagram || '',
          tiktok:    socials.tiktok    || '',
          twitter:   socials.twitter   || '',
          linkedin:  socials.linkedin  || '',
        },
        ...(livingIn ? { location: { city: livingIn } } : {}),
      }

      const res = await api.put('/users/profile', payload)
      updateUser(res.data?.data?.user || {})
      await refreshUser()
      toast.success('Profile saved!')
      navigate('/main/profile')
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to save profile')
    } finally {
      setSaving(false)
    }
  }

  const SOCIAL_FIELDS = [
    { key: 'facebook',  icon: <FaFacebook  className="text-blue-600" />, placeholder: 'https://facebook.com/username' },
    { key: 'instagram', icon: <FaInstagram className="text-pink-500" />, placeholder: 'https://instagram.com/username' },
    { key: 'tiktok',    icon: <FaTiktok    className="text-gray-900" />, placeholder: 'https://tiktok.com/@username' },
    { key: 'twitter',   icon: <FaTwitter   className="text-blue-400" />, placeholder: 'https://twitter.com/username' },
    { key: 'linkedin',  icon: <FaLinkedin  className="text-blue-700" />, placeholder: 'https://linkedin.com/in/username' },
  ]

  const slots = Array.from({ length: 6 })

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-12 pb-3 border-b border-gray-100">
        <button
          onClick={() => navigate('/main/profile')}
          className="w-9 h-9 flex items-center justify-center hover:bg-gray-100 rounded-full transition-colors"
        >
          <IoArrowBack className="text-xl text-gray-700" />
        </button>
        <span className="text-base font-bold text-gray-900">Edit Profile</span>
        <button
          onClick={handleSave}
          disabled={saving}
          className="text-primary-600 font-bold text-sm disabled:opacity-50 active:opacity-70"
        >
          {saving ? <Spinner size="sm" color="purple" /> : 'Save'}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto pb-10">
        {/* Photo grid */}
        <div className="px-4 pt-5">
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handleFileChange}
          />
          <div className="grid grid-cols-3 gap-2.5">
            {slots.map((_, idx) => {
              const photo = photos[idx]
              return (
                <div
                  key={idx}
                  className="relative rounded-2xl overflow-hidden bg-gray-100 border border-gray-200"
                  style={{ paddingTop: '130%' }}
                >
                  {photo ? (
                    <>
                      <img
                        src={photo.preview}
                        alt={`Photo ${idx + 1}`}
                        className={`absolute inset-0 w-full h-full object-cover transition-opacity ${photo.uploading ? 'opacity-50' : 'opacity-100'}`}
                      />
                      {photo.uploading && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Spinner size="sm" color="purple" />
                        </div>
                      )}
                      {!photo.uploading && (
                        <button
                          type="button"
                          onClick={() => handleRemovePhoto(idx)}
                          className="absolute top-1.5 right-1.5 bg-white rounded-full shadow text-gray-700 hover:text-red-500 transition-colors z-10"
                        >
                          <IoCloseCircle className="text-2xl" />
                        </button>
                      )}
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={() => photos.length < 6 && inputRef.current?.click()}
                      disabled={photos.length >= 6}
                      className="absolute inset-0 flex items-center justify-center group disabled:cursor-not-allowed"
                    >
                      <IoAddOutline className="text-2xl text-gray-400 group-hover:text-primary-400 transition-colors" />
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Form */}
        <div className="px-4 mt-6 flex flex-col gap-4">
          {/* Nickname + Birthday */}
          <div className="grid grid-cols-2 gap-3">
            <FieldRow label="Nickname">
              <TextInput value={nickname} onChange={setNickname} placeholder="Your name" maxLength={30} />
            </FieldRow>
            <FieldRow label="Birthday">
              <input
                type="date"
                value={birthday}
                onChange={(e) => setBirthday(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3.5 text-sm
                           text-gray-800 focus:outline-none focus:border-primary-400 focus:bg-white
                           transition-all appearance-none"
              />
            </FieldRow>
          </div>

          {/* Gender + Pronouns */}
          <div className="grid grid-cols-2 gap-3">
            <FieldRow label="Gender">
              <SelectInput value={gender} onChange={setGender} options={GENDERS} placeholder="Gender" />
            </FieldRow>
            <FieldRow label="Pronouns">
              <SelectInput value={pronouns} onChange={setPronouns} options={PRONOUNS} placeholder="Pronouns" />
            </FieldRow>
          </div>

          {/* Height + Weight */}
          <div className="grid grid-cols-2 gap-3">
            <FieldRow label="Height">
              <SelectInput value={height} onChange={setHeight} options={HEIGHTS_CM} placeholder="Height" />
            </FieldRow>
            <FieldRow label="Weight">
              <SelectInput value={weight} onChange={setWeight} options={WEIGHTS_KG} placeholder="Weight" />
            </FieldRow>
          </div>

          {/* Job Title */}
          <FieldRow label="Job Title">
            <TextInput value={jobTitle} onChange={setJobTitle} placeholder="e.g. Product Designer" />
          </FieldRow>

          {/* Company */}
          <FieldRow label="Company">
            <TextInput value={company} onChange={setCompany} placeholder="e.g. Google LLC" />
          </FieldRow>

          {/* School */}
          <FieldRow label="School / University">
            <TextInput value={school} onChange={setSchool} placeholder="e.g. Columbia University" />
          </FieldRow>

          {/* Living in */}
          <FieldRow label="Living in">
            <TextInput value={livingIn} onChange={setLivingIn} placeholder="City name" />
          </FieldRow>

          {/* About Me */}
          <FieldRow label="About Me">
            <textarea
              value={aboutMe}
              onChange={(e) => setAboutMe(e.target.value)}
              placeholder="Tell others about yourself..."
              maxLength={500}
              rows={4}
              className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3.5 text-base
                         text-gray-800 placeholder-gray-400 focus:outline-none focus:border-primary-400
                         focus:bg-white transition-all resize-none"
            />
            <p className="text-right text-xs text-gray-400">{aboutMe.length}/500</p>
          </FieldRow>
        </div>

        {/* Interests */}
        <div className="px-4 mt-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-gray-900">Interests <span className="text-gray-400 font-normal">(up to 5)</span></h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {INTERESTS_LIST.map(({ name, emoji }) => {
              const selected = interests.includes(name)
              return (
                <button
                  key={name}
                  type="button"
                  onClick={() => toggleInterest(name)}
                  className={`px-3.5 py-2 rounded-full text-sm font-medium border transition-all active:scale-95 flex items-center gap-1.5
                    ${selected
                      ? 'bg-primary-600 text-white border-primary-600'
                      : 'bg-white text-gray-700 border-gray-200 hover:border-primary-300'
                    }`}
                >
                  <span aria-hidden="true">{emoji}</span>{name}
                </button>
              )
            })}
          </div>
          {interests.length >= 5 && (
            <p className="text-xs text-gray-400 mt-2">Max 5 interests selected</p>
          )}
        </div>

        {/* Languages */}
        <div className="px-4 mt-6">
          <h3 className="text-sm font-bold text-gray-900 mb-3">Languages I Know</h3>
          <div className="flex flex-wrap gap-2">
            {LANGUAGES_LIST.map((lang) => {
              const selected = languages.includes(lang)
              return (
                <button
                  key={lang}
                  type="button"
                  onClick={() => toggleLanguage(lang)}
                  className={`px-3.5 py-2 rounded-full text-sm font-medium border transition-all active:scale-95
                    ${selected
                      ? 'bg-primary-600 text-white border-primary-600'
                      : 'bg-white text-gray-700 border-gray-200 hover:border-primary-300'
                    }`}
                >
                  {lang}
                </button>
              )
            })}
          </div>
        </div>

        {/* Relationship Goals */}
        <div className="px-4 mt-6">
          <h3 className="text-sm font-bold text-gray-900 mb-3">Relationship Goals</h3>
          <div className="flex flex-wrap gap-2">
            {RELATIONSHIP_GOALS.map((goal) => (
              <button
                key={goal}
                type="button"
                onClick={() => setRelationshipGoal(goal === relationshipGoal ? '' : goal)}
                className={`px-4 py-2 rounded-full text-sm font-medium border transition-all active:scale-95
                  ${relationshipGoal === goal
                    ? 'bg-primary-600 text-white border-primary-600'
                    : 'bg-white text-gray-700 border-gray-200 hover:border-primary-300'
                  }`}
              >
                {goal} 💕
              </button>
            ))}
          </div>
        </div>

        {/* Social Media */}
        <div className="px-4 mt-6">
          <h3 className="text-sm font-bold text-gray-900 mb-3">Social Media</h3>
          <div className="flex flex-col gap-3">
            {SOCIAL_FIELDS.map(({ key, icon, placeholder }) => (
              <div key={key} className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3">
                <span className="text-xl flex-shrink-0">{icon}</span>
                <input
                  type="url"
                  value={socials[key]}
                  onChange={(e) => setSocials({ ...socials, [key]: e.target.value })}
                  placeholder={placeholder}
                  className="flex-1 bg-transparent text-base text-gray-600 placeholder-gray-400 focus:outline-none"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Save button */}
        <div className="px-4 mt-8">
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full py-4 bg-primary-600 text-white font-bold text-base rounded-3xl
                       shadow-lg shadow-primary-200 active:scale-95 transition-transform disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {saving ? <><Spinner size="sm" /> Saving...</> : 'Save Profile'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default EditProfilePage
