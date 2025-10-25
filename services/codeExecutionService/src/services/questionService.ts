import { getDb } from '../database/index.js'
import { ObjectId } from 'mongodb'
import { Question, TestCase } from '../models/questionModel.js'
import { AppError } from '../utils/errors.js'
import { getLogger } from '../utils/logger.js'

const logger = getLogger('questionService')

const getQuestionCollection = () => getDb().collection<Question>('questions')

export const getQuestionById = async (
  questionId: string
): Promise<Question> => {
  const collection = getQuestionCollection()
  const question = await collection.findOne({ _id: new ObjectId(questionId) })

  if (!question) {
    throw new AppError(`Question with ID ${questionId} not found`, 404)
  }

  logger.info(`Fetched question: ${questionId}`)
  return question
}

export const getTestCases = async (
  questionId: string,
  mode: 'run' | 'submit'
): Promise<TestCase[]> => {
  const question = await getQuestionById(questionId)

  if (mode === 'run') {
    // RUN mode: only return examples (is_hidden: false)
    const exampleCases = question.examples || []
    logger.info(
      `Returning ${exampleCases.length} example cases for question ${questionId}`
    )
    return exampleCases
  } else {
    // SUBMIT mode: return examples + test_cases (all test cases)
    const exampleCases = question.examples || []
    const testCases = question.test_cases || []
    const allCases = [...exampleCases, ...testCases]
    logger.info(
      `Returning ${allCases.length} total test cases for question ${questionId}`
    )
    return allCases
  }
}
