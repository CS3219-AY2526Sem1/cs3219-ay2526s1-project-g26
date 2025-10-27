export const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || 'http://localhost'

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/user/auth/login',
    REGISTER: '/api/user/auth/register',
    VERIFY_TOKEN: '/api/user/auth/verify-token',
  },
  PROFILE: {
    GET: '/api/user/profile/me',
    UPDATE: '/api/user/profile',
  },
  MATCHING: '/api/matching',
  QUESTION: {
    MATCH: '/api/question/match',
    GET_BY_ID: '/api/question',
    GET_TOPICS_AND_DIFFICULTIES: '/api/question/cnd',
  },
  HISTORY: {
    GET_USER_SUBMISSIONS: '/api/history/submissions',
  },
} as const

export const WEBSOCKET_BASE_URL =
  process.env.REACT_APP_WEBSOCKET_BASE_URL || 'ws://localhost'

export const WEBSOCKET_URL = {
  COLLABORATION: '/collaboration',
}

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
} as const
