import { getDb } from '../database/index.js'
import { AppError } from '../utils/errors.js'
import {
  UserSubmission,
  Submission,
  type ResultInformation,
  SubmissionHistoryResponse
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
    .skip((page - 1) * perPage)
    .limit(perPage)
    .toArray()
  const total = await getUserSubmissionsCollection().countDocuments()

  const submissions = await getSubmissionsCollection()
  .find(
    { _id: { $in: userSubmissions.map(submission => submission.submission_id) || [] } },
  )
  .toArray()

  return { submissions, total }
}