import { getDb } from '../database/index.js'
import { AppError } from '../utils/errors.js'
import {
  UserSubmission,
  Submission,
  SubmissionHistoryResponse,
  SubmissionSummary,
  SubmissionDetailsResponse,
} from '../models/submissionHistoryModel.js'
import { ObjectId } from 'mongodb'

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
): Promise<SubmissionDetailsResponse> => {
  const pipeline = [
    {
      $match: {
        user_id: userId,
        submission_id: submissionId,
      },
    },
    { $limit: 1 },
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
    // Should not be needed since ObjectID is unique?
    { $limit: 1 },
    {
      $project: {
        _id: 0,
        title: '$submissionDetails.question_title',
        submission_time: {
          $dateToString: {
            format: '%Y-%m-%d %H:%M',
            date: { $toDate: '$submissionDetails._id' },
          },
        },
        language: '$submissionDetails.language',
        code: '$submissionDetails.code',
        status: {
          $cond: {
            if: {
              $eq: ['$submissionDetails.overall_result.result', 'Accepted']
            },
            then: 'Passed',
            else: 'Failed',
          },
        },
        difficulty: '$submissionDetails.difficulty',
        categories: '$submissionDetails.categories',
        runtime: {
          $concat: [
            { $toString: '$submissionDetails.overall_result.time_taken' },
            ' ms',
          ],
        },
        memory: {
          $concat: [
            { $toString: '$submissionDetails.overall_result.max_memory_used' },
            ' MB',
          ],
        },
        error_message:
          '$submissionDetails.overall_result.additional_information',
      },
    },
  ]

  const [submission] = await getUserSubmissionsCollection()
    .aggregate(pipeline)
    .toArray()
  if (!submission) {
    throw new AppError('Submission not found', 404)
  }
  return submission as SubmissionDetailsResponse
}
