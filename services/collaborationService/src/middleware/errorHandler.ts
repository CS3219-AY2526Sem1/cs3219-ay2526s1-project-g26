import { Request, Response, NextFunction } from 'express'
import { AppError } from '../utils/errors'
import { getLogger } from '../utils/logger'

const logger = getLogger('ErrorHandler')

export default (
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  let statusCode = 500
  let message = 'Internal Server Error'

  if (err instanceof AppError) {
    statusCode = err.statusCode
    message = err.message
  }

  logger.error({
    message,
    stack: (err as Error)?.stack,
    method: req.method,
    url: req.originalUrl,
    body: req.body,
  })

  return res.status(statusCode).json({
    success: false,
    message,
  })
}
