import express from 'express'
import {
  getProfile,
  updateProfile,
  getPublicProfile,
  getFilters,
  updateFilters,
  uploadPhoto,
  deletePhoto,
  discoverUsers,
  searchUsers,
  likeUser,
  superLikeUser,
  passUser,
  getMatches,
} from '../controllers/userController.js'
import { protect } from '../middleware/authMiddleware.js'
import { updateProfileValidation } from '../middleware/validationMiddleware.js'
import { upload, handleUploadError } from '../middleware/uploadMiddleware.js'

const router = express.Router()

// All routes require authentication
router.use(protect)

// Profile
router.get('/profile',  getProfile)
router.put('/profile',  updateProfileValidation, updateProfile)

// Filter Preferences
router.get('/filters',  getFilters)
router.put('/filters',  updateFilters)

// Search
router.get('/search',   searchUsers)

// Discover & Matching
router.get('/discover', discoverUsers)
router.get('/matches',  getMatches)
router.post('/:userId/like',       likeUser)
router.post('/:userId/super-like', superLikeUser)
router.post('/:userId/pass',       passUser)

// Public profile — must come AFTER specific named routes to avoid conflicts
router.get('/:userId/profile', getPublicProfile)

// Photos
router.post('/photos',              upload.single('photo'), handleUploadError, uploadPhoto)
router.delete('/photos/:photoId',   deletePhoto)

export default router
