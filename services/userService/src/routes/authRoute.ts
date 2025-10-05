import { Router } from 'express'
import { AppError } from '../utils/errors.js'
import { loginUser, createUser } from '../services/authService.js'
import { authenticate, AuthRequest } from '../middleware/auth.js'

const router = Router()

router.post('/register', async (req, res, next) => {
  const { email, password, full_name } = req.body
  if (!email || !password) {
    return next(new AppError('Email and password are required', 400))
  }

  const user = await createUser(email, password, full_name)
  return res.json({ success: true, user })
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
      return next(new AppError('You do not have the permission!', 401))
    }
    return res.json({ success: true, user: req.user })
  }
)

export default router
