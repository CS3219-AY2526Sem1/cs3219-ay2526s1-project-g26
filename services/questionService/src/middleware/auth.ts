import { NextFunction, Request, Response } from 'express'
import { AppError } from '../utils/errors.js'
import * as Config from '../config/index.js'
import { User } from '../types/user.js'

interface AuthConfig {
  shouldBeAdmin: boolean
}

interface SuccessResponse {
  user: User
  success: true
}

export const authenticate =
  (config?: AuthConfig) =>
  async (req: Request, _res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization

    try {
      const res = await fetch(
        `${Config.USER_SERVICE_URL}/auth/verify-token?shouldBeAdmin=${config?.shouldBeAdmin ? 'true' : 'false'}`,
        {
          method: 'POST',
          headers: { authorization: authHeader },
        }
      )

      if (!res.ok) {
        throw new AppError('Unauthorized', res.status)
      }

      const data = (await res.json()) as SuccessResponse
      req.user = data.user
      next()
    } catch (err) {
      let statusCode = 401
      let message = 'Authentication failed'

      if (err instanceof AppError) {
        message = err.message
        statusCode = err.statusCode
      }

      next(new AppError(message, statusCode))
    }
  }
