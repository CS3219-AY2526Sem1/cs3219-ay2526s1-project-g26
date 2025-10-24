export const PORT = process.env.PORT || 4050
export const QUESTION_SERVICE_URL =
  process.env.QUESTION_SERVICE_URL || 'http://question-service:4010'
export const DATABASE_URL =
  process.env.DATABASE_URL || 'mongodb://question-service-db:27017/questions_db'

// Execution limits (apply to all questions)
export const TIME_LIMIT = 15000
