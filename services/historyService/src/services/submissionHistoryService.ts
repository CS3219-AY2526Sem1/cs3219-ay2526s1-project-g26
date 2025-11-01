import { getDb } from '../database/index.js'
import { AppError } from '../utils/errors.js'
import {
  UserSubmission,
  SubmissionHistoryResponse,
  SubmissionSummary,
  SubmissionDetailsResponse,
  Submission,
} from '../models/submissionHistoryModel.js'
import { CreateSubmissionBody } from '../models/submissionHistoryModel.js'
import redisClient from '../database/redis.js'

const getUserSubmissionsCollection = () =>
  getDb().collection<UserSubmission>('user_submissions')

const getSubmissionsCollection = () =>
  getDb().collection<Submission>('submissions')

export const getUserSubmissions = async (
  userId: string,
  page: number,
  limit: number
): Promise<SubmissionHistoryResponse> => {
  const pipeline = [
    {
      $match: {
        user_id: userId,
      },
    },
    { $sort: { _id: -1 } },
    { $skip: page * limit },
    { $limit: limit },
    {
      $addFields: {
        submission_obj_id: { $toObjectId: '$submission_id' },
        mode: '$mode',
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
        mode: '$submissionDetails.mode',
        submission_id: { $toString: '$submissionDetails._id' },
        title: '$submissionDetails.question_title',
        submission_time: {
          $dateToString: {
            format: '%Y-%m-%d %H:%M',
            date: { $toDate: '$submissionDetails._id' },
            timezone: '+08:00', // hardcode for now
          },
        },
        overall_status: '$submissionDetails.overall_result.result',
        difficulty: '$submissionDetails.difficulty',
        language: '$submissionDetails.language',
      },
    },
    { $match: { mode: 'submit' } },
    {
      $facet: {
        data: [{ $project: { mode: 0 } }],
        metadata: [{ $count: 'total' }],
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
    // Should not be needed since ObjectID is unique?
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
    {
      $project: {
        _id: 0,
        mode: '$submissionDetails.mode',
        title: '$submissionDetails.question_title',
        submission_time: {
          $dateToString: {
            format: '%Y-%m-%d %H:%M',
            date: { $toDate: '$submissionDetails._id' },
            timezone: '+08:00', // hardcode for now
          },
        },
        language: '$submissionDetails.language',
        code: '$submissionDetails.code',
        status: {
          $cond: {
            if: {
              $eq: ['$submissionDetails.overall_result.result', 'Accepted'],
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
    { $match: { mode: 'submit' } },
    { $project: { mode: 0 } },
  ]

  const [submission] = await getUserSubmissionsCollection()
    .aggregate(pipeline)
    .toArray()

  if (!submission) {
    throw new AppError('Submission not found', 404)
  }
  return submission as SubmissionDetailsResponse
}

export const insertSubmission = async (data: CreateSubmissionBody) => {
  const result = await getSubmissionsCollection().insertOne(data.result)
  if (data.user_ids.length !== 2) {
    return
  }
  await redisClient.set(data.result.ticket_id, JSON.stringify(data.result), {
    EX: 15,
  })
  const submissionId = result.insertedId.toString()
  await getUserSubmissionsCollection().insertMany([
    { user_id: data.user_ids[0], submission_id: submissionId },
    { user_id: data.user_ids[1], submission_id: submissionId },
  ])
}
