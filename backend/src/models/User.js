import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

const photoSchema = new mongoose.Schema({
  url: { type: String, required: true },
  publicId: { type: String, required: true },
  isPrimary: { type: Boolean, default: false },
})

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false,
    },
    isEmailVerified: { type: Boolean, default: false },
    emailVerificationToken: String,
    emailVerificationExpires: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,

    // Core profile fields
    name: { type: String, trim: true },
    age: { type: Number, min: 18, max: 100 },
    birthday: { type: String },          // stored as YYYY-MM-DD string
    bio: { type: String, maxlength: 500 },
    gender: {
      type: String,
      enum: ['male', 'female', 'non-binary', 'other', 'prefer-not-to-say'],
    },
    pronouns: { type: String, trim: true },   // e.g. "He/Him"
    interestedIn: {
      type: String,
      enum: ['men', 'women', 'everyone'],
    },

    // Physical attributes
    height: { type: String, trim: true },   // e.g. "5'11""
    weight: { type: String, trim: true },   // e.g. "76 kg"

    // Professional
    jobTitle: { type: String, trim: true },
    company:  { type: String, trim: true },
    school:   { type: String, trim: true },

    // Location
    location: {
      city: String,
      country: String,
      coordinates: {
        type: [Number], // [longitude, latitude]
        index: '2dsphere',
      },
    },

    // Media
    photos: [photoSchema],

    // Preferences
    interests: [{ type: String }],
    languages: [{ type: String }],           // e.g. ['English', 'Spanish']
    relationshipGoal: {
      type: String,
      enum: ['dating', 'friendship', 'casual', 'serious', 'networking', 'open', 'exploration', ''],
      default: '',
    },
    distancePreference: { type: Number, default: 80, min: 5, max: 500 },

    // Social media links
    socialMedia: {
      facebook:  { type: String, trim: true, default: '' },
      instagram: { type: String, trim: true, default: '' },
      tiktok:    { type: String, trim: true, default: '' },
      twitter:   { type: String, trim: true, default: '' },
      linkedin:  { type: String, trim: true, default: '' },
    },

    profileSetupComplete: { type: Boolean, default: false },
    profileCompletion:    { type: Number, default: 15 },

    // ─── Discovery / Filter Preferences ──────────────────────────────────
    filterPreferences: {
      distanceRange:     { type: Number, default: 200, min: 5, max: 500 },
      ageMin:            { type: Number, default: 20, min: 18, max: 80 },
      ageMax:            { type: Number, default: 35, min: 18, max: 80 },
      minPhotos:         { type: Number, default: 1, min: 1, max: 6 },
      showMe:            { type: String, enum: ['men', 'women', 'everyone'], default: 'everyone' },
      relationshipGoals: [{ type: String }],
      hasBio:            { type: Boolean, default: false },
      interests:         [{ type: String }],
    },

    // Matching
    likedUsers:      [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    superLikedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    blockedUsers:    [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],

    // Premium
    isPremium:       { type: Boolean, default: false },
    premiumExpiresAt: Date,

    lastActive: { type: Date, default: Date.now },
    isActive:   { type: Boolean, default: true },
  },
  {
    timestamps: true,
    toJSON:     { virtuals: true },
    toObject:   { virtuals: true },
  }
)

// Indexes
userSchema.index({ email: 1 })
userSchema.index({ 'location.coordinates': '2dsphere' })

// Hash password before save
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next()
  this.password = await bcrypt.hash(this.password, 12)
  next()
})

// Compare passwords
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password)
}

// Profile completion calculator
userSchema.methods.calculateCompletion = function () {
  const fields = [
    this.name,
    this.age,
    this.bio,
    this.gender,
    this.interestedIn,
    this.location?.city,
    this.photos?.length > 0,
    this.interests?.length > 0,
  ]
  const filled = fields.filter(Boolean).length
  this.profileCompletion = Math.round((filled / fields.length) * 100)
  return this.profileCompletion
}

// Virtual: primary photo
userSchema.virtual('primaryPhoto').get(function () {
  return this.photos?.find((p) => p.isPrimary) || this.photos?.[0] || null
})

const User = mongoose.model('User', userSchema)
export default User
