import { Router, Request, Response } from 'express'

const router = Router()

/**
 * GET /health
 * Health check endpoint
 */
router.get('/health', (_req: Request, res: Response) => {
  return res.status(200).json({
    success: true,
    message: 'Code Execution Service is healthy',
    timestamp: new Date().toISOString(),
  })
})

export default router
