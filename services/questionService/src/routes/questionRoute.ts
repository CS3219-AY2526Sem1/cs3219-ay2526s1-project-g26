import { Router } from 'express'
import { getMatchingQuestion } from '../services/questionService.js'
import { authenticate } from '../middleware/auth.js'

const router = Router()

router.get('/match', authenticate, async (req, res) => {
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

export default router
