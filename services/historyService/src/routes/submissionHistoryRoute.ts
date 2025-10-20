import { Router } from 'express'
import {
  getUserSubmission,
  getUserSubmissions,
} from '../services/submissionHistoryService.js'
import { authenticate } from '../middleware/auth.js'
import { AppError } from '../utils/errors.js'

const router = Router()

router.get('/submissions/:page/:per_page', authenticate(), async (req, res) => {
  const id = req.user!.id
  const pages = parseInt(req.params.page)
  const perPage = parseInt(req.params.per_page)

  const submissions = await getUserSubmissions(id, pages, perPage)
  if (!submissions) {
    throw new AppError('Submissions not found', 404)
  }
  return res.json({ success: true, submissions })
})

router.get('/submissions/:submission_id', authenticate(), async (req, res) => {
  const id = req.user!.id
  const submissionId = req.params.submission_id
  const submission = await getUserSubmission(id, submissionId)
  if (!submission) {
    throw new AppError('Submission not found', 404)
  }
  return res.json({ success: true, submission })
})

router.post('/submissions', async (req, res) => {
  // ignore for now until integration with submission-grading service is needed
  // given that is called by a backend service, removing authenticate for now?
})

router.put('/submissions/:submission_id', authenticate(), async (req, res) => {
  // ignore for now, not sure if this should neeed authenticate() anyway
})

export default router
