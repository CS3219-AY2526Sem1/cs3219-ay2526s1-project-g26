import { getDb } from '../database/index.js'
import { AppError } from '../utils/errors.js'
import {
  Question,
  CreateQuestionInput,
  type MatchedQuestion,
} from '../models/questionModel.js'
import { ensureArray } from '../utils'
import { type Document, ObjectId, type UpdateFilter, WithoutId } from 'mongodb'

const getQuestionCollection = () => getDb().collection<Question>('questions')

/**
 * Finds the best matching question from the database based on difficulty and categories.
 *
 * This function calculates a similarity score for each question in the collection based on the provided criteria.
 * The score is weighted: 40% for a matching difficulty and 60% for matching categories.
 * The category match score is calculated as `(intersection of categories) / (number of user-provided categories)`.
 * It then identifies all questions with the highest score and randomly selects one to return.
 * This ensures that if multiple questions are an equally good match, the user receives a varied experience.
 *
 * @param difficulty - The desired difficulty level ('easy', 'medium', 'hard').
 * @param categories - A comma-separated string of desired categories (e.g., 'array,string,hash-table').
 * @returns A promise that resolves to the question object that best matches the criteria, containing a subset of fields.
 * @throws {AppError} Throws an error if the questions collection is empty and no question can be returned.
 */
export const getMatchingQuestion = async (
  difficulty: string,
  categories: string
): Promise<MatchedQuestion> => {
  const categoriesArray = categories
    ? (categories as string).split(',').map((c) => c.trim())
    : []

  const pipeline: Document[] = [
    {
      $addFields: {
        similarityScore: {
          $add: [
            {
              $cond: {
                if: { $eq: ['$difficulty', difficulty] },
                then: 0.4,
                else: 0,
              },
            },
            categoriesArray.length > 0
              ? {
                  $multiply: [
                    {
                      $divide: [
                        {
                          $size: {
                            $setIntersection: ['$categories', categoriesArray],
                          },
                        },
                        categoriesArray.length,
                      ],
                    },
                    0.6,
                  ],
                }
              : 0,
          ],
        },
      },
    },
    {
      $sort: {
        similarityScore: -1,
      },
    },
    {
      $group: {
        _id: null,
        maxScore: { $first: '$similarityScore' },
        questions: { $push: '$$ROOT' },
      },
    },
    {
      $unwind: '$questions',
    },
    {
      $match: {
        $expr: {
          $eq: ['$questions.similarityScore', '$maxScore'],
        },
      },
    },
    {
      $replaceRoot: {
        newRoot: '$questions',
      },
    },
    {
      $sample: {
        size: 1,
      },
    },
    {
      $project: {
        _id: 1,
        description: 1,
        title: 1,
        difficulty: 1,
        categories: 1,
        hints: 1,
        constraints: 1,
        examples: 1,
      },
    },
  ]

  const questions = await getQuestionCollection()
    .aggregate<MatchedQuestion>(pipeline)
    .toArray()

  if (!questions || questions.length === 0) {
    throw new AppError('No questions available in the database.', 404)
  }

  return questions[0]
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
    .find({}, { projection: { _id: 0, name: 1 } })
    .toArray()

  const difficultiesDocs = await difficultiesCollection
    .find({}, { projection: { _id: 0, level: 1 } })
    .toArray()

  const categories = categoriesDocs.map((doc: { name: string }) => doc.name)
  const difficulties = difficultiesDocs.map((doc: { level: string }) => doc.level)

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
    examples: ensureArray(data.examples!),
    hints: ensureArray(data.hints!),
    categories: ensureArray(data.categories),
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
