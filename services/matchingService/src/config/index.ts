export const PORT = process.env.PORT || 4020
export const DATABASE_URL = process.env.DATABASE_URL || 'redis://localhost:6379'
export const USER_SERVICE_URL =
  process.env.USER_SERVICE_URL || 'http://localhost:4000'
export const QUESTION_SERVICE_URL =
  process.env.QUESTION_SERVICE_URL || 'http://localhost:4010'
