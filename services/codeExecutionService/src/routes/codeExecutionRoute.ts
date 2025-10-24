import { Router, Request, Response } from 'express'
import { validateCode } from '../services/CodeExecutionService.js'
import { ExecuteCodeRequest } from '../types/index.js'
import { getLogger } from '../utils/logger.js'

const router = Router()
const logger = getLogger('codeExecutionRoute')

/**
 * POST /execute
 * Execute user code against test cases
 *
 * Request body:
 * {
 *   "question_id": "68ecad71f7fd251842ce5f54",
 *   "language": "python" | "cpp" | "javascript",
 *   "code_text": "user's source code",
 *   "mode": "run" | "submit"
 * }
 *
 * Response:
 * {
 *   "status": "Accepted" | "Wrong Answer" | ...,
 *   "passed_tests": 2,
 *   "total_tests": 2,
 *   "execution_time": 90,
 *   "output": "...",      // Optional: actual output if wrong
 *   "error": "..."        // Optional: error message if failed
 * }
 */
router.post('/execute', async (req: Request, res: Response) => {
  try {
    const { question_id, language, code_text, mode }: ExecuteCodeRequest =
      req.body

    // Validate required fields
    if (!question_id || !language || !code_text || !mode) {
      logger.warn('Missing required fields in request')
      return res.status(400).json({
        success: false,
        message:
          'Missing required fields: question_id, language, code_text, mode',
      })
    }

    // Validate language
    const validLanguages = ['cpp', 'python', 'javascript']
    if (!validLanguages.includes(language)) {
      logger.warn(`Invalid language: ${language}`)
      return res.status(400).json({
        success: false,
        message: `Invalid language. Supported: ${validLanguages.join(', ')}`,
      })
    }

    logger.info(
      `Received execution request - Question: ${question_id}, Language: ${language}, Mode: ${mode}`
    )

    // Execute code and validate against test cases
    const result = await validateCode(
      question_id,
      language as 'cpp' | 'python' | 'javascript',
      code_text,
      mode
    )

    logger.info(
      `Execution completed - Status: ${result.status}, Passed: ${result.passed_tests}/${result.total_tests}`
    )

    // Return result
    return res.status(200).json({
      success: true,
      result,
    })
  } catch (error) {
    logger.error(
      `Execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    )

    // Let error handler middleware handle it
    throw error
  }
})

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
