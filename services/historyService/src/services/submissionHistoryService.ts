import { getDb } from '../database/index.js'
import { AppError } from '../utils/errors.js'
import {
  UserSubmission,
  Submission,
  type ResultInformation,
  SubmissionHistoryResponse,
  SubmissionSummary
} from '../models/submissionHistoryModel.js'
import { ensureArray } from '../utils/index.js'
import { type Document, ObjectId, type UpdateFilter, WithoutId } from 'mongodb'

const getSubmissionsCollection = () => getDb().collection<Submission>('submissions')
const getUserSubmissionsCollection = () => getDb().collection<UserSubmission>('user_submissions')

export const getUserSubmissions = async(userId: string, page: number, perPage: number): Promise<SubmissionHistoryResponse> => {

  const userSubmissions = await getUserSubmissionsCollection()
  .find(
      { user_id: userId },
      {
        projection: {
          _id: 0,
          user_id: 0
        }
      }
    )
    // apparently objectId contains timestamp info, which may be sortable directly
    // https://stackoverflow.com/questions/5125521/uses-for-mongodb-objectid-creation-time
    .sort({ '_id': -1 })
    .skip(page * perPage)
    .limit(perPage)
    .toArray()
  const total = await getUserSubmissionsCollection().countDocuments({ user_id: userId})

  const submissions = await getSubmissionsCollection()
  .find(
    { _id: { $in: userSubmissions.map(submission => new ObjectId(submission.submission_id)) } },
  )
  .toArray()

  let submissionSummaries: SubmissionSummary[] = []
  for (const submission of submissions) {
    let submissionSummary: SubmissionSummary = {
      submission_id: submission._id.toString(),
      title: submission.question_title,
      submission_time: (submission._id as ObjectId).getTimestamp().toISOString(),
      overall_status: submission.overall_result.result,
      difficulty: submission.difficulty,
      language: submission.language,
    }
    submissionSummaries.push(submissionSummary)
  }

  return { submissions: submissionSummaries, total }
}