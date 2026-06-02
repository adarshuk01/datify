import { v2 as cloudinary } from 'cloudinary'
import dotenv from 'dotenv'

dotenv.config()

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
})

export const uploadToCloudinary = async (filePath, folder = 'datify') => {
  const result = await cloudinary.uploader.upload(filePath, {
    folder,
    transformation: [{ width: 800, height: 800, crop: 'fill', gravity: 'face' }],
    quality: 'auto',
    fetch_format: 'auto',
  })
  return {
    url: result.secure_url,
    publicId: result.public_id,
    width: result.width,
    height: result.height,
  }
}

export const deleteFromCloudinary = async (publicId) => {
  await cloudinary.uploader.destroy(publicId)
}

export default cloudinary
