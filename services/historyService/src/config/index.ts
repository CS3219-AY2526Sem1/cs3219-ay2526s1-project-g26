export const PORT = process.env.PORT || 4040
export const DATABASE_URL =
  process.env.DATABASE_URL || 'mongodb://history-service-db:27017/history_db'
export const USER_SERVICE_URL =
  process.env.USER_SERVICES_URL || 'http://user-service:4000'
export const REDIS_URL = process.env.REDIS_URL || 'http://localhost:6379'
