import { Router, Request, Response } from 'express'
import {
  ExecuteCodeRequest,
  Question,
  SubmissionResult,
  Language,
} from '../types/index.js'
import { getLogger } from '../utils/logger.js'
import { randomUUID } from 'crypto'
import {
  createSubmissionResult,
  getQuestionWithTestCases,
} from '../services/questionService.js'
import { validateCode } from '../services/codeExecutionService.js'

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
    const {
      question_id,
      language,
      code_text,
      mode,
      user_ids,
    }: ExecuteCodeRequest = req.body

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

    const ticketId = randomUUID()

    setTimeout(async () => {
      const question: Question = await getQuestionWithTestCases(
        question_id,
        mode
      )
      const submissionResult: SubmissionResult = await validateCode(
        question.test_cases,
        language as Language,
        code_text
      )
      const data = {
        result: {
          question_id, // new
          question_title: question.title,
          categories: question.categories,
          difficulty: question.difficulty,
          code: code_text,
          language: language as Language,
          mode,
          ticket_id: ticketId,
          overall_result: {
            result: submissionResult.status,
            max_memory_used: submissionResult.memory_used,
            time_taken: submissionResult.execution_time,
            error: submissionResult.error, // new
            output: submissionResult.output, // new
            passed_tests: submissionResult.passed_tests, // new
            total_tests: submissionResult.total_tests, // new
          },
        },
        user_ids,
      }
      await createSubmissionResult(data)
    }, 50)

    // Return result
    return res.status(200).json({
      success: true,
      ticketId,
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
