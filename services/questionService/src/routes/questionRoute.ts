import { Router } from 'express'
import {
  getMatchingQuestion,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  getAllQuestions,
  getQuestionById,
  getAllCategoryAndDifficulty,
  getQuestionTestCases,
} from '../services/questionService.js'
import { authenticate } from '../middleware/auth.js'
import { AppError } from '../utils/errors.js'

const router = Router()

router.get('/match', authenticate(), async (req, res) => {
  const { difficulty, categories } = req.query

  if (!difficulty) {
    return res.status(400).json({ error: 'Difficulty is required' })
  }

  const question = await getMatchingQuestion(
    difficulty as string,
    categories as string
  )
  return res.json({ success: true, question })
})

router.get('/cnd', async (_req, res) => {
  const { categories, difficulties } = await getAllCategoryAndDifficulty()
  return res.json({ success: true, categories, difficulties })
})

router.get('/:id', authenticate(), async (req, res) => {
  const id = req.params.id
  const question = await getQuestionById(id)
  if (!question) {
    throw new AppError('Question not found', 404)
  }
  return res.json({ success: true, question })
})

// Special endpoint for code execution service - includes test_cases and no auth required
router.get('/:id/test-cases', async (req, res) => {
  const id = req.params.id
  const { type } = req.query

  if (type !== 'public' && type !== 'private' && type !== 'all') {
    throw new AppError('Invalid test cases type', 401)
  }

  const question = await getQuestionTestCases(id, type)
  if (!question) {
    throw new AppError('Question not found', 404)
  }
  return res.json({ success: true, question })
})

router.get('/', authenticate({ shouldBeAdmin: true }), async (req, res) => {
  const page = parseInt(req.query.page as string) || 1
  const limit = parseInt(req.query.limit as string) || 10
  const offset = (page - 1) * limit

  const { questions, total } = await getAllQuestions(limit, offset)

  return res.json({
    success: true,
    metadata: {
      page,
      total_pages: Math.ceil(total / limit),
      total_questions: total,
    },
    items: questions,
  })
})

router.post('/', authenticate({ shouldBeAdmin: true }), async (req, res) => {
  const question = await createQuestion(req.body)
  res.status(201).json({ success: true, question })
})

router.put('/:id', authenticate({ shouldBeAdmin: true }), async (req, res) => {
  const id = req.params.id
  const question = await updateQuestion(id, req.body)
  res.json({ success: true, question })
})

router.delete(
  '/:id',
  authenticate({ shouldBeAdmin: true }),
  async (req, res) => {
    const id = req.params.id
    await deleteQuestion(id)
    res.json({ success: true, message: 'Question deleted' })
  }
)

export default router
