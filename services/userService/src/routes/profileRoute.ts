import express from 'express'
import { AppError } from '../utils/errors.js'
import { updateUserProfile } from '../services/profileService'

const router = express.Router()

export default router

router.put('/update', async (req, res, next) => {
  const { id, email, password, full_name } = req.body
  if (!id) {
    return next(new AppError('User ID is required', 400))
  }
  if (!email || !password) {
    return next(new AppError('Email and password are required', 400))
  }

  const result = await updateUserProfile(id, email, password, full_name)
  return res.json({ success: true, ...result })
})
