import User from '../models/User.js'
import Conversation from '../models/Conversation.js'
import { uploadToCloudinary, deleteFromCloudinary } from '../config/cloudinary.js'
import { successResponse, errorResponse, paginatedResponse } from '../utils/response.js'
import { emitNewMatch } from '../config/socket.js'

// Haversine formula — returns distance in km between two [lng, lat] coordinate pairs
const haversineKm = (coords1, coords2) => {
  if (!coords1?.length || !coords2?.length) return null
  const [lng1, lat1] = coords1
  const [lng2, lat2] = coords2
  const R  = 6371
  const dL = ((lat2 - lat1) * Math.PI) / 180
  const dG = ((lng2 - lng1) * Math.PI) / 180
  const a  =
    Math.sin(dL / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dG / 2) ** 2
  return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)))
}

// Safe user shape — includes ALL fields needed by frontend
const safeUser = (user) => ({
  id:    user._id,
  email: user.email,
  name:  user.name  || null,
  age:   user.age   || null,
  birthday: user.birthday || null,
  bio:   user.bio   || null,
  isEmailVerified:     user.isEmailVerified,
  profileCompletion:   user.profileCompletion   || 15,
  profileSetupComplete: user.profileSetupComplete || false,
  isPremium:           user.isPremium            || false,
  gender:              user.gender               || null,
  pronouns:            user.pronouns             || null,
  interestedIn:        user.interestedIn         || null,
  height:              user.height               || null,
  weight:              user.weight               || null,
  jobTitle:            user.jobTitle             || null,
  company:             user.company              || null,
  school:              user.school               || null,
  interests:           user.interests            || [],
  languages:           user.languages            || [],
  relationshipGoal:    user.relationshipGoal     || '',
  distancePreference:  user.distancePreference   || 80,
  socialMedia:         user.socialMedia          || {},
  primaryPhoto:        user.primaryPhoto         || null,
  filterPreferences:   user.filterPreferences    || {},
  photos: (user.photos || []).map((p) => ({
    _id:       p._id,
    url:       p.url,
    publicId:  p.publicId,
    isPrimary: p.isPrimary,
  })),
  // CRITICAL: must include location so frontend MainRoute can check coordinates
  location: {
    city:        user.location?.city        || null,
    country:     user.location?.country     || null,
    coordinates: user.location?.coordinates || [],
  },
})

// Public profile shape — for viewing another user's profile
const publicProfile = (user, myCoords) => ({
  id:              user._id,
  name:            user.name            || null,
  age:             user.age             || null,
  bio:             user.bio             || null,
  gender:          user.gender          || null,
  pronouns:        user.pronouns        || null,
  height:          user.height          || null,
  weight:          user.weight          || null,
  jobTitle:        user.jobTitle        || null,
  company:         user.company         || null,
  school:          user.school          || null,
  interests:       user.interests       || [],
  relationshipGoal: user.relationshipGoal || null,
  socialMedia:     user.socialMedia      || {},
  distance:        haversineKm(myCoords, user.location?.coordinates),
  photos: (user.photos || []).map((p) => (typeof p === 'string' ? p : p.url)),
  location: {
    city:    user.location?.city    || null,
    country: user.location?.country || null,
  },
})

// ─── Get current user profile ──────────────────────────────────────────────

export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
    if (!user) return errorResponse(res, 'User not found', 404)
    return successResponse(res, { user: safeUser(user) })
  } catch (error) {
    console.error('Get profile error:', error)
    return errorResponse(res, 'Failed to get profile')
  }
}

// ─── Get a specific user's public profile ─────────────────────────────────

export const getPublicProfile = async (req, res) => {
  try {
    const { userId } = req.params

    const [targetUser, currentUser] = await Promise.all([
      User.findById(userId).select(
        'name age bio gender pronouns height weight jobTitle company school interests relationshipGoal socialMedia photos location'
      ),
      User.findById(req.user._id).select('location blockedUsers'),
    ])

    if (!targetUser) return errorResponse(res, 'User not found', 404)

    // Don't return blocked users
    if (currentUser?.blockedUsers?.map(String).includes(userId)) {
      return errorResponse(res, 'User not found', 404)
    }

    const myCoords = currentUser?.location?.coordinates
    return successResponse(res, { user: publicProfile(targetUser, myCoords) })
  } catch (error) {
    console.error('Get public profile error:', error)
    return errorResponse(res, 'Failed to get profile')
  }
}

// ─── Update profile ────────────────────────────────────────────────────────

export const updateProfile = async (req, res) => {
  try {
    const allowedFields = [
      'name', 'age', 'birthday', 'bio', 'gender', 'pronouns', 'interestedIn',
      'height', 'weight', 'jobTitle', 'company', 'school',
      'interests', 'languages', 'relationshipGoal', 'distancePreference',
      'profileSetupComplete',
    ]
    const updates = {}
    allowedFields.forEach((f) => { if (req.body[f] !== undefined) updates[f] = req.body[f] })

    // Handle location via dot-notation to avoid Mongoose nested-update validator bugs
    const loc = req.body.location
    if (loc) {
      if (loc.city    !== undefined) updates['location.city']    = loc.city
      if (loc.country !== undefined) updates['location.country'] = loc.country
      if (Array.isArray(loc.coordinates) && loc.coordinates.length === 2) {
        updates['location.coordinates'] = loc.coordinates.map(Number)
      }
    }

    // Handle socialMedia sub-object
    const sm = req.body.socialMedia
    if (sm && typeof sm === 'object') {
      const keys = ['facebook', 'instagram', 'tiktok', 'twitter', 'linkedin']
      keys.forEach((k) => {
        if (sm[k] !== undefined) updates[`socialMedia.${k}`] = sm[k]
      })
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updates },
      { new: true, runValidators: false }
    )
    if (!user) return errorResponse(res, 'User not found', 404)
    user.calculateCompletion()
    await user.save({ validateBeforeSave: false })
    return successResponse(res, { user: safeUser(user) }, 'Profile updated successfully')
  } catch (error) {
    console.error('Update profile error:', error)
    return errorResponse(res, 'Failed to update profile')
  }
}

// ─── Filter Preferences ────────────────────────────────────────────────────

export const getFilters = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('filterPreferences')
    if (!user) return errorResponse(res, 'User not found', 404)

    const defaults = {
      distanceRange:     200,
      ageMin:            20,
      ageMax:            35,
      minPhotos:         1,
      showMe:            'everyone',
      relationshipGoals: [],
      hasBio:            false,
      interests:         [],
    }

    return successResponse(res, {
      filters: { ...defaults, ...(user.filterPreferences?.toObject?.() || user.filterPreferences || {}) },
    })
  } catch (error) {
    console.error('Get filters error:', error)
    return errorResponse(res, 'Failed to get filter preferences')
  }
}

export const updateFilters = async (req, res) => {
  try {
    const { filters } = req.body
    if (!filters || typeof filters !== 'object') {
      return errorResponse(res, 'filters object is required', 400)
    }

    const allowed = ['distanceRange', 'ageMin', 'ageMax', 'minPhotos', 'showMe', 'relationshipGoals', 'hasBio', 'interests']
    const updates = {}
    allowed.forEach((k) => {
      if (filters[k] !== undefined) updates[`filterPreferences.${k}`] = filters[k]
    })

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updates },
      { new: true, runValidators: false }
    )
    if (!user) return errorResponse(res, 'User not found', 404)

    return successResponse(res, { filters: user.filterPreferences }, 'Filter preferences saved')
  } catch (error) {
    console.error('Update filters error:', error)
    return errorResponse(res, 'Failed to save filter preferences')
  }
}

// ─── Photos ────────────────────────────────────────────────────────────────

export const uploadPhoto = async (req, res) => {
  try {
    if (!req.file) return errorResponse(res, 'No file uploaded', 400)
    const user = await User.findById(req.user._id)
    if (!user) return errorResponse(res, 'User not found', 404)
    if (user.photos.length >= 6) return errorResponse(res, 'Maximum 6 photos allowed', 400)

    const uploaded = await uploadToCloudinary(req.file.path, 'datify/photos')
    user.photos.push({
      url:       uploaded.url,
      publicId:  uploaded.publicId,
      isPrimary: user.photos.length === 0,
    })
    user.calculateCompletion()
    await user.save({ validateBeforeSave: false })
    return successResponse(res, { photos: user.photos }, 'Photo uploaded successfully', 201)
  } catch (error) {
    console.error('Photo upload error:', error)
    return errorResponse(res, 'Failed to upload photo')
  }
}

export const deletePhoto = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
    if (!user) return errorResponse(res, 'User not found', 404)
    const photo = user.photos.id(req.params.photoId)
    if (!photo) return errorResponse(res, 'Photo not found', 404)
    if (photo.publicId) {
      try { await deleteFromCloudinary(photo.publicId) } catch (e) {
        console.warn('Cloudinary delete failed:', e.message)
      }
    }
    user.photos.pull(req.params.photoId)
    if (photo.isPrimary && user.photos.length > 0) user.photos[0].isPrimary = true
    user.calculateCompletion()
    await user.save({ validateBeforeSave: false })
    return successResponse(res, { photos: user.photos }, 'Photo deleted successfully')
  } catch (error) {
    console.error('Delete photo error:', error)
    return errorResponse(res, 'Failed to delete photo')
  }
}

// ─── Discover (with filter preferences applied) ───────────────────────────

export const discoverUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query
    const currentUser = await User.findById(req.user._id)
    if (!currentUser) return errorResponse(res, 'User not found', 404)

    const skip = (Number(page) - 1) * Number(limit)

    const excludeIds = [
      req.user._id,
      ...(currentUser.likedUsers      || []),
      ...(currentUser.superLikedUsers || []),
      ...(currentUser.blockedUsers    || []),
    ]

    const fp = currentUser.filterPreferences || {}

    // Build query using filter preferences
    const query = { _id: { $nin: excludeIds }, isActive: true }

    // Show Me filter (gender)
    const showMe = fp.showMe || currentUser.interestedIn || 'everyone'
    if (showMe && showMe !== 'everyone') {
      const genderMap = { men: 'male', women: 'female' }
      if (genderMap[showMe]) query.gender = genderMap[showMe]
    }

    // Age range filter
    const ageMin = fp.ageMin || 18
    const ageMax = fp.ageMax || 80
    query.age = { $gte: ageMin, $lte: ageMax }

    // Has bio filter
    if (fp.hasBio) {
      query.bio = { $exists: true, $ne: '' }
    }

    // Minimum photos filter
    if (fp.minPhotos && fp.minPhotos > 1) {
      query[`photos.${fp.minPhotos - 1}`] = { $exists: true }
    }

    // Relationship goals filter
    if (fp.relationshipGoals && fp.relationshipGoals.length > 0) {
      query.relationshipGoal = { $in: fp.relationshipGoals }
    }

    // Interests filter (at least one match)
    if (fp.interests && fp.interests.length > 0) {
      query.interests = { $in: fp.interests }
    }

    const [users, total] = await Promise.all([
      User.find(query)
        .select('name age bio gender photos interests location')
        .skip(skip).limit(Number(limit)).lean(),
      User.countDocuments(query),
    ])

    const myCoords       = currentUser.location?.coordinates
    const distanceLimit  = fp.distanceRange || 500 // km

    const mapped = users
      .map((u) => {
        const dist = haversineKm(myCoords, u.location?.coordinates)
        return {
          id:        u._id,
          _id:       u._id,
          name:      u.name || 'Anonymous',
          age:       u.age  || null,
          distance:  dist,
          photos:    (u.photos || []).map((p) => p.url),
          bio:       u.bio  || '',
          interests: u.interests || [],
        }
      })
      // Filter by distance (only when coords available)
      .filter((u) => myCoords && myCoords.length === 2
        ? (u.distance === null || u.distance <= distanceLimit)
        : true
      )

    return paginatedResponse(res, mapped, total, page, limit, 'Users fetched successfully')
  } catch (error) {
    console.error('Discover error:', error)
    return errorResponse(res, 'Failed to fetch users')
  }
}

// ─── Search Users ──────────────────────────────────────────────────────────

export const searchUsers = async (req, res) => {
  try {
    const { q = '', page = 1, limit = 20 } = req.query
    if (!q.trim()) return successResponse(res, { users: [] }, 'No query provided')

    const currentUser = await User.findById(req.user._id)
    const excludeIds  = [req.user._id, ...(currentUser?.blockedUsers || [])]

    const regex = new RegExp(q.trim(), 'i')
    const query = {
      _id:      { $nin: excludeIds },
      isActive: true,
      $or: [{ name: regex }],
    }

    const skip  = (Number(page) - 1) * Number(limit)
    const users = await User.find(query)
      .select('name age photos location')
      .skip(skip).limit(Number(limit)).lean()

    const myCoords = currentUser?.location?.coordinates

    const mapped = users.map((u) => ({
      id:       u._id,
      name:     u.name || 'Anonymous',
      age:      u.age  || null,
      distance: haversineKm(myCoords, u.location?.coordinates),
      photo:    u.photos?.[0]?.url || null,
    }))

    return successResponse(res, { users: mapped }, 'Search results')
  } catch (error) {
    console.error('Search error:', error)
    return errorResponse(res, 'Search failed')
  }
}

// ─── Actions ───────────────────────────────────────────────────────────────

export const likeUser = async (req, res) => {
  try {
    const { userId } = req.params
    const myId = req.user._id.toString()
    if (userId === myId) return errorResponse(res, "You can't like yourself", 400)

    const [targetUser, currentUser] = await Promise.all([
      User.findById(userId),
      User.findById(myId),
    ])
    if (!targetUser) return errorResponse(res, 'User not found', 404)
    if (currentUser.likedUsers.map(String).includes(userId))
      return errorResponse(res, 'Already liked this user', 400)

    currentUser.likedUsers.push(userId)
    await currentUser.save({ validateBeforeSave: false })

    const isMatch =
      targetUser.likedUsers.map(String).includes(myId) ||
      (targetUser.superLikedUsers || []).map(String).includes(myId)

    // Auto-create conversation the instant a mutual match happens
    if (isMatch) {
      const existing = await Conversation.findOne({
        participants: { $all: [myId, userId], $size: 2 },
      })
      if (!existing) {
        await Conversation.create({
          participants: [myId, userId],
          unreadCounts: { [myId]: 0, [userId]: 0 },
        })
        // Notify both users via socket so ChatsPage refreshes instantly
        emitNewMatch(myId, userId)
      }
    }

    return successResponse(res, { isMatch }, isMatch ? "It's a match! 🎉" : 'User liked!')
  } catch (error) {
    return errorResponse(res, 'Failed to like user')
  }
}

export const superLikeUser = async (req, res) => {
  try {
    const { userId } = req.params
    if (userId === req.user._id.toString()) return errorResponse(res, "You can't super like yourself", 400)

    const currentUser = await User.findById(req.user._id)
    if (currentUser.superLikedUsers.map(String).includes(userId))
      return errorResponse(res, 'Already super liked this user', 400)

    currentUser.superLikedUsers.push(userId)
    await currentUser.save({ validateBeforeSave: false })
    return successResponse(res, {}, 'Super liked!')
  } catch (error) {
    return errorResponse(res, 'Failed to super like user')
  }
}

export const passUser = async (req, res) => {
  try {
    const { userId } = req.params
    const currentUser = await User.findById(req.user._id)
    if (!currentUser.blockedUsers.map(String).includes(userId)) {
      currentUser.blockedUsers.push(userId)
      await currentUser.save({ validateBeforeSave: false })
    }
    return successResponse(res, {}, 'Passed!')
  } catch (error) {
    return errorResponse(res, 'Failed to pass user')
  }
}

// ─── Matches ───────────────────────────────────────────────────────────────

const toMatchProfile = (u, myCoords) => ({
  id:        u._id,
  name:      u.name || 'Anonymous',
  age:       u.age  || null,
  distance:  haversineKm(myCoords, u.location?.coordinates),
  photos:    (u.photos || []).map((p) => (typeof p === 'string' ? p : p.url)),
  interests: u.interests || [],
})

export const getMatches = async (req, res) => {
  try {
    const myId = req.user._id.toString()

    const currentUser = await User.findById(myId)
      .populate('likedUsers',      'name age photos interests location')
      .populate('superLikedUsers', 'name age photos interests location')

    if (!currentUser) return errorResponse(res, 'User not found', 404)

    const myCoords = currentUser.location?.coordinates

    // Mutual likes
    const likeMatches = []
    for (const liked of currentUser.likedUsers) {
      const likedUser = await User.findById(liked._id).select('likedUsers')
      if (likedUser?.likedUsers?.map(String).includes(myId)) {
        likeMatches.push(toMatchProfile(liked, myCoords))
      }
    }

    // Super likes (all users I super-liked)
    const superLikeMatches = currentUser.superLikedUsers.map((u) => toMatchProfile(u, myCoords))

    return successResponse(res, {
      likes:      likeMatches,
      superLikes: superLikeMatches,
    }, 'Matches fetched successfully')
  } catch (error) {
    console.error('Get matches error:', error)
    return errorResponse(res, 'Failed to fetch matches')
  }
}
