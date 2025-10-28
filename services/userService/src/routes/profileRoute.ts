import express from 'express'
import { AppError } from '../utils/errors.js'
import {
  updateUserProfile,
  getUserProfile,
} from '../services/profileService.js'
import { type AuthRequest } from '../middleware/auth.js'

const router = express.Router()

router.get('/me', async (req: AuthRequest, res) => {
  const profile = await getUserProfile(req!.user?.id)
  return res.json({ success: true, user: profile })
})

router.put('/', async (req: AuthRequest, res, next) => {
  const { email, password, full_name } = req.body
  if (!email) {
    return next(new AppError('Email must be provided', 400))
  } else if (!full_name) {
    return next(new AppError('Full name must be provided', 400))
  }

  await updateUserProfile(req!.user?.id, email, password, full_name)
  return res.status(201).json({ success: true })
})

export default router
