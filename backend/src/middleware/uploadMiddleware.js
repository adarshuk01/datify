import multer from 'multer'
import path from 'path'
import os from 'os'
import fs from 'fs'
import { errorResponse } from '../utils/response.js'

// Use OS temp dir — works on Windows (C:\Users\...\AppData\Local\Temp),
// macOS (/var/folders/...) and Linux (/tmp) automatically
const TMP_DIR = os.tmpdir()

// Ensure the tmp dir exists (it always should, but just in case)
if (!fs.existsSync(TMP_DIR)) {
  fs.mkdirSync(TMP_DIR, { recursive: true })
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, TMP_DIR)
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`
    const ext = path.extname(file.originalname).toLowerCase() || '.jpg'
    cb(null, `photo-${uniqueSuffix}${ext}`)
  },
})

const fileFilter = (_req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(new Error('Only JPEG, PNG, and WebP images are allowed'), false)
  }
}

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
})

export const handleUploadError = (err, _req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return errorResponse(res, 'File too large. Maximum size is 5MB', 400)
    }
    return errorResponse(res, err.message, 400)
  }
  if (err) {
    return errorResponse(res, err.message, 400)
  }
  next()
}
