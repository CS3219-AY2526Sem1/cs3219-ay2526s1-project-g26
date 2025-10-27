export const PORT = process.env.PORT || 4050
const BACKEND_BASE_URL = process.env.BACKEND_BASE_URL || 'http://localhost'
export const QUESTION_SERVICE_URL = `${BACKEND_BASE_URL}/api/question`
export const USER_SERVICE_URL = `${BACKEND_BASE_URL}/api/user`
export const TIME_LIMIT = 1000
