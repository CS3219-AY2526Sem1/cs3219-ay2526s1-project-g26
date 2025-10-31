import { MongoClient, Db, ObjectId } from 'mongodb'
import { DATABASE_URL } from '../config/index.js'

let db: Db

export const connectDB = async (): Promise<void> => {
  const client = new MongoClient(DATABASE_URL)
  await client.connect()
  db = client.db()

  console.log('Connected to MongoDB')

  // Uncomment to clean up dev database
  /* await db.dropCollection('submissions')
  await db.dropCollection('user_submissions')
  await db.createCollection('submissions')
  await db.createCollection('user_submissions') */
}

export const getDb = (): Db => {
  if (!db) {
    throw new Error('Call connectDB before getDb')
  }
  return db
}
