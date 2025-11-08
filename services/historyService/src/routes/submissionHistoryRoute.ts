import { Router } from 'express'
import {
  getRoomSubmissions,
  getUserSubmission,
  getUserSubmissions,
} from '../services/submissionHistoryService.js'
import { authenticate } from '../middleware/auth.js'
import { AppError } from '../utils/errors.js'
import redisClient from '../database/redis.js'

const router = Router()

router.get('/submissions/', authenticate(), async (req, res) => {
  const id = req.user!.id
  const page = parseInt((req.query?.page as string) || '1')
  const limit = parseInt((req.query?.limit as string) || '10')

  const submissions = await getUserSubmissions(id, page, limit)
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

router.get('/submissions/status/:ticket_id', authenticate(), async (req, res) => {
  const { ticket_id } = req.params
  if (!ticket_id) {
    throw new AppError('Ticket ID is necessary', 401)
  }
  const data = await redisClient.get(ticket_id)
  if (!data) {
    return res.status(202).send()
  }
  return res.status(200).send({ success: true, result: JSON.parse(data) })
})

router.get('/rooms/:room_id', authenticate(), async (req, res) => {
  console.log(req.params)
  const roomId = req.params.room_id
  const page = parseInt((req.query?.page as string) || '1')
  const limit = parseInt((req.query?.limit as string) || '10')

  const submissions = await getRoomSubmissions(roomId, page, limit)
  if (!submissions) {
    throw new AppError('Invalid room id', 404)
  }
  return res.json({ success: true, submissions })
})

export default router
