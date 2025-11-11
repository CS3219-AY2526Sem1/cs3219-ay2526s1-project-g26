import redis from '../database/redis.js'
import { REDIS } from '../constants/index.js'
import { Question } from '../models/questionModel.js'
import { connectDB, getDb } from '../database/index.js'

const TWELVE_HOURS = 12 * 60 * 60 * 1000
const FETCH_INTERVAL = TWELVE_HOURS - Math.random() * 60 * 60 * 1000

const loadQuestion = async () => {
  const lastUpdate: string | null = await redis.get(
    REDIS.QUESTION_LAST_UPDATE_KEY
  )
  const timeNow: number = new Date().getTime()
  if (lastUpdate && Number(lastUpdate) + TWELVE_HOURS > timeNow) {
    return
  }

  await connectDB()
  const questions = await getDb()
    .collection<Pick<Question, '_id' | 'categories' | 'difficulty'>>(
      'questions'
    )
    .find(
      {},
      {
        projection: {
          _id: 1,
          categories: 1,
          difficulty: 1,
        },
      }
    )
    .toArray()

  await redis.mset(
    REDIS.QUESTIONS_KEY,
    JSON.stringify(questions),
    REDIS.QUESTION_LAST_UPDATE_KEY,
    timeNow.toString()
  )
}

loadQuestion()

setInterval(() => void loadQuestion(), FETCH_INTERVAL)
