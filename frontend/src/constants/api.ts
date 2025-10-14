export const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || 'http://localhost/api'

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/user/auth/login',
    REGISTER: '/user/auth/register',
    VERIFY_TOKEN: '/user/auth/verify-token',
    FORGOT_PASSWORD: '/user/auth/forgot-password',
    RESET_PASSWORD: '/user/auth/reset-password',
  },
} as const

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
} as const
