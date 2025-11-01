import { Request, Response, NextFunction } from 'express'
import { AppError } from '../utils/errors.js'
import { getLogger } from '../utils/logger.js'

const logger = getLogger('ErrorHandler')

export default (
  err: Error | AppError,
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
