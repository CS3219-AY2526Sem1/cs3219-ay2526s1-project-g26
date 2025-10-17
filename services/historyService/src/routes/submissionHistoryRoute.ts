import { Router } from 'express'
import {
  getUserSubmissions
} from '../services/submissionHistoryService.js'
import { authenticate } from '../middleware/auth.js'
import { AppError } from '../utils/errors.js'

const router = Router()


router.get('/submissions/:page/:per_page', authenticate(), async (req, res) => {
  const id = req.params.user!.id
  const pages = parseInt(req.params.page)
  const perPage = parseInt(req.params.per_page)

  const submissions = await getUserSubmissions(id, pages, perPage)
  if (!submissions) {
    throw new AppError('Submissons not found', 404)
  }
  return res.json({ success: true, submissions })
})

router.get('/submission/:submission_id', authenticate(), async (req, res) => {

})

router.post('/submissions', authenticate(), async (req, res) => {

})

router.put('/submissions/:submission_id', authenticate(), async (req, res) => {

})


export default router
