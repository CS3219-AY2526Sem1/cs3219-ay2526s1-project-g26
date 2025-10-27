export const PORT = process.env.PORT || 4020
export const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379'
const BACKEND_BASE_URL = process.env.BACKEND_BASE_URL || 'http://localhost'
export const USER_SERVICE_URL = `${BACKEND_BASE_URL}/api/user`
export const QUESTION_SERVICE_URL = `${BACKEND_BASE_URL}/api/question`
