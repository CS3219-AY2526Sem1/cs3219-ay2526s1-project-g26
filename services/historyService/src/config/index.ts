export const PORT = process.env.PORT || 4040
export const DATABASE_URL =
  process.env.DATABASE_URL || 'mongodb://history-service-db:27017/questions_db'
export const USER_SERVICE_URL =
  process.env.USER_SERVICES_URL || 'http://user-service:4000'
