import { getDb } from '../database/index.js'
import { AppError } from '../utils/errors.js'
import {
  UserSubmission,
  SubmissionHistoryResponse,
  SubmissionSummary,
  SubmissionDetailsResponse,
  Submission,
  RoomSubmissionSummary,
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
            format: '%Y-%m-%d %H:%M:%S UTC',
            date: { $toDate: '$submissionDetails._id' },
          },
        },
        overall_status: '$submissionDetails.overall_result.result',
        difficulty: '$submissionDetails.difficulty',
        language: '$submissionDetails.language',
      },
    },
    { $match: { mode: 'submit' } },
    { $skip: page * limit },
    { $limit: limit },
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
        question_id: '$submissionDetails.question_id',
        mode: '$submissionDetails.mode',
        question_title: '$submissionDetails.question_title',
        submission_time: {
          $dateToString: {
            date: { $toDate: '$submissionDetails._id' },
          },
        },
        language: '$submissionDetails.language',
        code: '$submissionDetails.code',
        difficulty: '$submissionDetails.difficulty',
        categories: '$submissionDetails.categories',
        overall_result: '$submissionDetails.overall_result',
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

export const getRoomSubmissions = async (
  roomId: string
): Promise<RoomSubmissionSummary[]> => {
  const submissionsCollection = getSubmissionsCollection()
  const projection = {
    _id: 1,
    'overall_result.result': 1,
    mode: 1,
    language: 1,
  }

  const submissions = await submissionsCollection
    .find(
      { room_id: roomId },
      {
        projection,
        sort: { _id: 1 },
      }
    )
    .toArray()

  const summaries: RoomSubmissionSummary[] = submissions.map((sub) => {
    return {
      submission_id: sub._id.toString(),
      status: sub.overall_result.result,
      mode: sub.mode,
      language: sub.language,
      submitted_at: sub._id.getTimestamp().toISOString(),
    }
  })

  return summaries
}

export const insertSubmission = async (data: CreateSubmissionBody) => {
  if (data.user_ids.length !== 2) {
    return
  }
  data.result.room_id = data.room_id
  const result = await getSubmissionsCollection().insertOne(data.result)
  const submissionId = result.insertedId.toString()
  await redisClient.set(
    data.result.ticket_id,
    JSON.stringify({
      submission_id: submissionId,
      status: data.result.overall_result.result,
      mode: data.result.mode,
      submitted_at: new Date(),
      language: data.result.language,
    }),
    {
      EX: 15,
    }
  )
  await getUserSubmissionsCollection().insertMany([
    {
      user_id: data.user_ids[0],
      submission_id: submissionId,
    },
    {
      user_id: data.user_ids[1],
      submission_id: submissionId,
    },
  ])
}
