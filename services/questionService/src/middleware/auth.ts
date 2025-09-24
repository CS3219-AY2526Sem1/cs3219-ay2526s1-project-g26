import { NextFunction, Request, Response } from 'express'
import { AppError } from '../utils/errors.js'
import jwt, { JwtPayload } from 'jsonwebtoken'
import * as Config from '../config/index.js'

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
    req.user = jwt.verify(token, Config.JWT_SECRET) as JwtPayload
    next()
  } catch (err) {
    next(err)
  }
}
