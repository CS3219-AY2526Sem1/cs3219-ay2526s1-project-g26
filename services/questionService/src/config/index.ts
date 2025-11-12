export const PORT = process.env.PORT || 4010
export const DATABASE_URL =
  process.env.DATABASE_URL || 'mongodb://question-service-db:27017/questions_db'
const BACKEND_BASE_URL = process.env.BACKEND_BASE_URL || 'http://localhost'
export const USER_SERVICE_URL = `${BACKEND_BASE_URL}/api/user`
export const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379'
