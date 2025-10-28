import { NextFunction, Request, Response } from 'express'
import { decodeToken } from '../services/authService.js'
import { AppError } from '../utils/errors.js'
import { JwtPayload } from 'jsonwebtoken'

export interface AuthRequest extends Request {
  user?: JwtPayload
}

export const authenticate = (
  req: AuthRequest,
  _res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new AppError('Authorization token missing', 401))
  }

  const token = authHeader.split(' ')[1]

  try {
    req.user = decodeToken(token)
    next()
  } catch (err) {
    next(err)
  }
}
