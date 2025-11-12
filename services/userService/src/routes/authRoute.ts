import { Router } from 'express'
import { AppError } from '../utils/errors.js'
import {
  loginUser,
  createUser,
  requestPasswordReset,
  resetPassword,
} from '../services/authService.js'
import { authenticate, AuthRequest } from '../middleware/auth.js'

const router = Router()

router.post('/register', async (req, res, next) => {
  const { email, password, full_name } = req.body
  if (!email || !password) {
    return next(new AppError('Email and password are required', 400))
  }

  const result = await createUser(email, password, full_name)
  return res.json({ success: true, ...result })
})

router.post('/login', async (req, res, next) => {
  const { email, password } = req.body
  if (!email || !password) {
    return next(new AppError('Email and password are required', 400))
  }

  const result = await loginUser(email, password)
  return res.json({ success: true, ...result })
})

router.post(
  '/verify-token',
  authenticate,
  async (req: AuthRequest, res, next) => {
    const shouldBeAdmin = req.query?.shouldBeAdmin
    if (shouldBeAdmin === 'true' && req.user?.role != 'admin') {
      return next(
        new AppError(
          'You do not have permissions to perform this operation!',
          401
        )
      )
    }
    return res.json({ success: true, user: req.user })
  }
)

router.post('/forgot-password', async (req, res, next) => {
  const { email } = req.body
  if (!email) {
    return next(new AppError('Email is required', 400))
  }

  const exists = await requestPasswordReset(email)
  if (!exists) {
    return next(new AppError('User not found', 404))
  }

  return res.json({ success: true, message: 'OTP has been sent' })
})

router.post('/reset-password', async (req, res, next) => {
  const { email, code, newPassword } = req.body
  if (!email || !code || !newPassword) {
    return next(new AppError('Email, code and new password are required', 400))
  }

  const ok = await resetPassword(email, code, newPassword)
  // Note: Should not normally occur due to resetPassword throwing errors on failure modes
  if (!ok) {
    return next(new AppError('OTP is incorrect or User does not exist', 400))
  }

  return res.json({ success: true, message: 'Successfully reset password' })
})

export default router
