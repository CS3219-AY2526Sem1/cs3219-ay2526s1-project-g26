import { Router } from 'express'
import {
  getUserSubmission,
  getUserSubmissions,
} from '../services/submissionHistoryService.js'
import { authenticate } from '../middleware/auth.js'
import { AppError } from '../utils/errors.js'

const router = Router()

router.get('/', authenticate(), async (req, res) => {
  const id = req.user!.id
  const page = parseInt((req.query?.page as string) || '1')
  const limit = parseInt((req.query?.limit as string) || '10')

  const submissions = await getUserSubmissions(id, page, limit)
  if (!submissions) {
    throw new AppError('Submissions not found', 404)
  }
  return res.json({ success: true, submissions })
})

router.get('/:submission_id', authenticate(), async (req, res) => {
  const id = req.user!.id
  const submissionId = req.params.submission_id
  const submission = await getUserSubmission(id, submissionId)
  if (!submission) {
    throw new AppError('Submission not found', 404)
  }
  return res.json({ success: true, submission })
})

router.post('/', async (_req, _res) => {
  // ignore for now until integration with submission-grading service is needed
  // given that is called by a backend service, removing authenticate for now?
})

router.put('/:submission_id', authenticate(), async (_req, _res) => {
  // ignore for now, not sure if this should neeed authenticate() anyway
})

export default router
