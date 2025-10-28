import axiosInstance from '../utils/axios.ts'
import { API_ENDPOINTS } from '../constants/api'
import {
  LoginFormData,
  LoginResponse,
  RegisterFormData,
  RegisterResponse,
} from '../types/auth.ts'

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
}

export default authService
