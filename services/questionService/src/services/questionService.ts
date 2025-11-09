import { getDb } from '../database/index.js'
import { AppError } from '../utils/errors.js'
import {
  Question,
  CreateQuestionInput,
  type MatchedQuestion,
  TestCase,
  QuestionPartial,
} from '../models/questionModel.js'
import { ensureArray } from '../utils/index.js'
import { ObjectId, type UpdateFilter, WithoutId } from 'mongodb'
import redis from '../database/redis.js'
import { REDIS } from '../constants/index.js'

const getQuestionCollection = () => getDb().collection<Question>('questions')

const calculateScore = (
  question: QuestionPartial,
  categories: string[],
  difficulties: string[]
) => {
  const overlappedCategories: number = question.categories.filter((category) =>
    categories.includes(category)
  ).length
  const overlappedDifficulties: number = Number(
    difficulties.includes(question.difficulty)
  )
  return (
    (((Math.min(overlappedCategories, 1) << 1) + overlappedDifficulties) << 6) +
    overlappedCategories
  )
}

/**
 * Finds the best matching question from the database based on difficulty and categories.
 *
 * @param difficulties - The desired difficulty levels (e.g., 'easy,medium').
 * @param categories - A comma-separated string of desired categories (e.g., 'array,string,hash-table').
 * @returns A promise that resolves to the question object that best matches the criteria, containing a subset of fields.
 * @throws {AppError} Throws an error if the questions collection is empty and no question can be returned.
 */
export const getMatchingQuestion = async (
  difficulties: string,
  categories: string
): Promise<MatchedQuestion> => {
  const categoriesArray: string[] = categories
    ? (categories as string).split(',').map((c) => c.trim())
    : []
  const difficultiesArray: string[] = difficulties
    ? (difficulties as string).split(',').map((c) => c.trim())
    : []

  let maxScore: number = -1
  let maxQuestionId: string | null = null

  await redis
    .get(REDIS.QUESTIONS_KEY)
    .then((result) => (result ? JSON.parse(result) : []) as QuestionPartial[])
    .then(
      (questions: QuestionPartial[]) =>
        void questions.forEach((question: QuestionPartial) => {
          const score = calculateScore(
            question,
            categoriesArray,
            difficultiesArray
          )
          if (score > maxScore || (score === maxScore && Math.random() > 0.5)) {
            maxScore = score
            maxQuestionId = question._id as string
          }
        })
    )

  const matchedQuestion =
    await getQuestionCollection().findOne<MatchedQuestion>(
      {
        _id: new ObjectId(maxQuestionId!),
      },
      { projection: { test_cases: 0, is_active: 0 } }
    )

  if (!matchedQuestion) {
    throw new AppError('Not Question Found', 404)
  }

  return matchedQuestion
}

export const getQuestionById = async (id: string): Promise<Question | null> => {
  const question = await getQuestionCollection().findOne(
    {
      _id: new ObjectId(id),
    },
    { projection: { test_cases: 0, is_active: 0 } }
  )
  if (!question) {
    throw new AppError('Question not found', 404)
  }
  return question
}

export const getQuestionTestCases = async (
  id: string,
  type: 'public' | 'private' | 'all'
): Promise<Partial<Question>> => {
  const pipeline = [
    {
      $match: { _id: new ObjectId(id) },
    },
    {
      $project: {
        _id: 0,
        title: 1,
        difficulty: 1,
        categories: 1,
        test_cases: {
          $map: {
            input: {
              $filter: {
                input: '$test_cases',
                as: 'tc',
                ...(type !== 'all'
                  ? {
                      cond: { $eq: ['$$tc.is_hidden', type === 'private'] },
                    }
                  : { cond: {} }),
              },
            },
            as: 'tc',
            in: {
              input: '$$tc.input',
              output: '$$tc.output',
            },
          },
        },
      },
    },
  ]
  const results = (
    await getQuestionCollection().aggregate(pipeline).toArray()
  )[0] as Question
  return results
}

export const getAllQuestions = async (
  limit: number,
  offset: number
): Promise<{ questions: Partial<Question>[]; total: number }> => {
  const questions = await getQuestionCollection()
    .find(
      {},
      {
        projection: {
          _id: 1,
          title: 1,
          difficulty: 1,
          categories: 1,
        },
      }
    )
    .sort({ created_at: -1 })
    .skip(offset)
    .limit(limit)
    .toArray()
  const total = await getQuestionCollection().countDocuments()

  return {
    questions,
    total,
  }
}

export const getAllCategoryAndDifficulty = async (): Promise<{
  categories: string[]
  difficulties: string[]
}> => {
  const db = getDb()

  const categoriesCollection = db.collection('categories')
  const difficultiesCollection = db.collection('difficulties')

  const categoriesDocs = await categoriesCollection
    .find<{ name: string }>({}, { projection: { _id: 0, name: 1 } })
    .toArray()

  const difficultiesDocs = await difficultiesCollection
    .find<{ level: string }>({}, { projection: { _id: 0, level: 1 } })
    .toArray()

  const categories = categoriesDocs.map((doc: { name: string }) => doc.name)
  const difficulties = difficultiesDocs.map(
    (doc: { level: string }) => doc.level
  )

  return { categories, difficulties }
}

export const updateQuestion = async (
  id: string,
  data: Partial<CreateQuestionInput>
): Promise<Question> => {
  const updateData: UpdateFilter<Question> = { $set: {} as Partial<Question> }

  for (const key of Object.keys(data) as (keyof CreateQuestionInput)[]) {
    const value = data[key]
    if (value !== undefined) {
      // @ts-expect-error passed
      updateData.$set[key] = value as Question[keyof Question]
    }
  }

  const result = await getQuestionCollection().findOneAndUpdate(
    { _id: new ObjectId(id) },
    updateData,
    { returnDocument: 'after' }
  )

  if (!result) {
    throw new AppError('Question not found', 404)
  }

  return result
}

export const createQuestion = async (
  data: CreateQuestionInput
): Promise<Question> => {
  const newQuestion: WithoutId<Question> = {
    ...data,
    constraints: ensureArray(data.constraints!),
    examples: ensureArray<{
      input: string
      output: string
    }>(data.examples!),
    hints: ensureArray(data.hints!),
    categories: ensureArray(data.categories),
    test_cases: ensureArray<TestCase>(data.test_cases),
    is_active: data.is_active ?? true,
  }

  const result = await getQuestionCollection().insertOne(
    newQuestion as Question
  )
  return { ...newQuestion, _id: (result.insertedId as ObjectId).toHexString() }
}

export const deleteQuestion = async (id: string): Promise<void> => {
  const result = await getQuestionCollection().deleteOne({
    _id: new ObjectId(id),
  })
  if (result.deletedCount === 0) {
    throw new AppError('Question not found', 404)
  }
}
