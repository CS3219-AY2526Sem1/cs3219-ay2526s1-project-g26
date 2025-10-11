import express from 'express'
import { AppError } from '../utils/errors.js'
import { updateUserProfile } from '../services/profileService'
import { decodeToken } from '../services/authService.js'

const router = express.Router()

export default router

router.put('/update', async (req, res, next) => {
  const { token, email, password, full_name } = req.body

  const verifiedToken = await decodeToken(token)
  if (!verifiedToken) {
    return next(
      new AppError(
        'Invalid token. User must be logged in to edit their profile',
        401
      )
    )
  }
  if (!email || !password) {
    return next(new AppError('Email and password are required', 400))
  }

  const result = await updateUserProfile(
    verifiedToken.id,
    email,
    password,
    full_name
  )
  return res.json({ success: true, ...result })
})
