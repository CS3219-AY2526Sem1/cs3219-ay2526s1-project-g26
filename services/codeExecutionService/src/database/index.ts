import { MongoClient, Db } from 'mongodb'
import { DATABASE_URL } from '../config/index.js'
import { getLogger } from '../utils/logger.js'

const logger = getLogger('database')

let db: Db

export const connectDB = async (): Promise<void> => {
  const client = new MongoClient(DATABASE_URL)
  await client.connect()
  db = client.db()
  logger.info('Connected to MongoDB')
}

export const getDb = (): Db => {
  if (!db) {
    throw new Error('Call connectDB before getDb')
  }
  return db
}
