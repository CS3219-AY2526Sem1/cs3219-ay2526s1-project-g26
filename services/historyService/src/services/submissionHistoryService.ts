import { getDb } from '../database/index.js'
import { AppError } from '../utils/errors.js'
import {
  UserSubmission,
  Submission,
  SubmissionHistoryResponse,
  SubmissionSummary,
  SingleSubmissionHistoryResponse,
} from '../models/submissionHistoryModel.js'
import { ObjectId } from 'mongodb'

const getSubmissionsCollection = () =>
  getDb().collection<Submission>('submissions')
const getUserSubmissionsCollection = () =>
  getDb().collection<UserSubmission>('user_submissions')

export const getUserSubmissions = async (
  userId: string,
  page: number,
  limit: number
): Promise<SubmissionHistoryResponse> => {
  const pipeline = [
    { $match: { user_id: userId } },
    {
      $facet: {
        metadata: [{ $count: 'total' }],
        data: [
          { $sort: { _id: -1 } },
          { $skip: page * limit },
          { $limit: limit },
          {
            $addFields: {
              submission_obj_id: { $toObjectId: '$submission_id' },
            },
          },
          {
            $lookup: {
              from: 'submissions',
              localField: 'submission_obj_id',
              foreignField: '_id',
              as: 'submissionDetails',
            },
          },
          { $unwind: '$submissionDetails' },
          {
            $project: {
              _id: 0,
              submission_id: { $toString: '$submissionDetails._id' },
              title: '$submissionDetails.question_title',
              submission_time: {
                $dateToString: {
                  format: '%Y-%m-%d %H:%M',
                  date: { $toDate: '$submissionDetails._id' },
                },
              },
              overall_status: '$submissionDetails.overall_result.result',
              difficulty: '$submissionDetails.difficulty',
              language: '$submissionDetails.language',
            },
          },
        ],
      },
    },
  ]
  const [result] = await getUserSubmissionsCollection()
    .aggregate(pipeline)
    .toArray()

  const submissions = (result?.data as SubmissionSummary[]) ?? []
  const total = result?.metadata[0]?.total ?? 0

  return { submissions, total }
}
// update whatever you want out of this yourself when integrating with the frontend
export const getUserSubmission = async (
  userId: string,
  submissionId: string
): Promise<SingleSubmissionHistoryResponse> => {
  const userSubmissions = await getUserSubmissionsCollection()
    .find(
      {
        user_id: userId,
        submission_id: submissionId,
      },
      {
        projection: {
          _id: 0,
          user_id: 0,
        },
      }
    )
    .limit(1)
    .toArray()

  const submissions = await getSubmissionsCollection()
    .find({
      _id: {
        $in: userSubmissions.map(
          (submission) => new ObjectId(submission.submission_id)
        ),
      },
    })
    .toArray()

  if (submissions.length === 0) {
    throw new AppError('Requested submission not found', 404)
  }
  return { submission: submissions[0] }
}
