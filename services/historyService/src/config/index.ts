export const PORT = process.env.PORT || 4040
export const DATABASE_URL =
  process.env.DATABASE_URL || 'mongodb://history-service-db:27017/history_db'
export const BACKEND_BASE_URL =
  process.env.BACKEND_BASE_URL || 'http://localhost'
export const USER_SERVICE_URL = `${BACKEND_BASE_URL}/api/user`
export const REDIS_URL = process.env.REDIS_URL || 'http://localhost:6379'
export const KAFKA_BROKERS =
  process.env.KAFKA_BROKERS || 'http://localhost:9092'
