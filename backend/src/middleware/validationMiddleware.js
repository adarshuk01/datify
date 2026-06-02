import { body, validationResult } from 'express-validator'
import { errorResponse } from '../utils/response.js'

export const validate = (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return errorResponse(res, 'Validation failed', 400, errors.array())
  }
  next()
}

export const signupValidation = [
  body('email')
    .isEmail().withMessage('Please enter a valid email')
    .toLowerCase(),
  body('password')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  validate,
]

export const loginValidation = [
  body('email')
    .isEmail().withMessage('Please enter a valid email')
    .toLowerCase(),
  body('password')
    .notEmpty().withMessage('Password is required'),
  validate,
]

export const updateProfileValidation = [
  body('name').optional().trim().isLength({ min: 2, max: 50 }).withMessage('Name must be 2-50 characters'),
  body('age').optional().isInt({ min: 18, max: 100 }).withMessage('Age must be between 18 and 100'),
  body('birthday').optional().isString(),
  body('bio').optional().isLength({ max: 500 }).withMessage('Bio must be under 500 characters'),
  body('gender')
    .optional()
    .isIn(['male', 'female', 'non-binary', 'other', 'prefer-not-to-say'])
    .withMessage('Invalid gender value'),
  body('pronouns').optional().isString().trim(),
  body('interestedIn')
    .optional()
    .isIn(['men', 'women', 'everyone'])
    .withMessage('Invalid interest value'),
  body('height').optional().isString().trim(),
  body('weight').optional().isString().trim(),
  body('jobTitle').optional().isString().trim(),
  body('company').optional().isString().trim(),
  body('school').optional().isString().trim(),
  body('relationshipGoal')
    .optional()
    .isIn(['dating', 'friendship', 'casual', 'serious', ''])
    .withMessage('Invalid relationship goal'),
  body('distancePreference')
    .optional()
    .isInt({ min: 5, max: 300 })
    .withMessage('Distance must be between 5 and 300 km'),
  body('interests')
    .optional()
    .isArray()
    .withMessage('Interests must be an array'),
  body('languages')
    .optional()
    .isArray()
    .withMessage('Languages must be an array'),
  body('profileSetupComplete')
    .optional()
    .isBoolean()
    .withMessage('profileSetupComplete must be boolean'),
  body('location').optional(),
  body('location.coordinates')
    .optional()
    .isArray({ min: 2, max: 2 })
    .withMessage('Coordinates must be [longitude, latitude]'),
  body('socialMedia').optional(),
  validate,
]
