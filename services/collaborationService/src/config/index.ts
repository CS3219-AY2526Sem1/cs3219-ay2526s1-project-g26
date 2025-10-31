export const PORT = process.env.PORT || '4030'
const BACKEND_BASE_URL = process.env.BACKEND_BASE_URL || 'http://nginx'
export const USER_SERVICE_URL = `${BACKEND_BASE_URL}/api/user`
export const CODE_EXECUTION_SERVICE_URL = `${BACKEND_BASE_URL}/api/code-execution`
export const KAFKA_BROKERS =
  process.env.KAFKA_BROKERS || 'http://localhost:9092'
