import axiosInstance from '../utils/axios.ts'
import { API_ENDPOINTS } from '../constants/api'
import {
  LoginFormData,
  LoginResponse,
  RegisterFormData,
  RegisterResponse,
} from '../types/auth.ts'

export interface ForgotPasswordResponse {
  success: boolean
  message: string
}

export interface ResetPasswordForm {
  email: string
  code: string
  newPassword: string
}

export const authService = {
  login: async (credentials: LoginFormData): Promise<LoginResponse> => {
    const response = await axiosInstance.post<LoginResponse>(
      API_ENDPOINTS.AUTH.LOGIN,
      credentials
    )
    return response.data
  },

  logout: (): void => {
    localStorage.removeItem('authToken')
    window.location.href = '/login'
  },

  register: async (userData: RegisterFormData): Promise<RegisterResponse> => {
    const response = await axiosInstance.post<RegisterResponse>(
      API_ENDPOINTS.AUTH.REGISTER,
      userData
    )
    return response.data
  },

  verifyToken: async (): Promise<LoginResponse> => {
    const authToken = window.localStorage.getItem('authToken')
    if (!authToken) {
      throw new Error('No token provided')
    }
    const response = await axiosInstance.post<LoginResponse>(
      API_ENDPOINTS.AUTH.VERIFY_TOKEN
    )
    return response.data
  },

  forgotPassword: async (email: string): Promise<ForgotPasswordResponse> => {
    const response = await axiosInstance.post<ForgotPasswordResponse>(
      API_ENDPOINTS.AUTH.FORGOT_PASSWORD,
      { email }
    )
    return response.data
  },

  resetPassword: async ({ email, code, newPassword }: ResetPasswordForm): Promise<ForgotPasswordResponse> => {
    const response = await axiosInstance.post<ForgotPasswordResponse>(
      API_ENDPOINTS.AUTH.RESET_PASSWORD,
      { email, code, newPassword }
    )
    return response.data
  },
}


export default authService
