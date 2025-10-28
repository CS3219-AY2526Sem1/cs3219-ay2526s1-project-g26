import axios, { InternalAxiosRequestConfig } from 'axios'
import { API_BASE_URL, HTTP_STATUS } from '../constants/api.ts'

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 50000,
  // modified because code execution may take longer than 10000ms
})

axiosInstance.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    if (config.data instanceof FormData) {
      config.headers.set('Content-Type', 'multipart/form-data')
    } else {
      config.headers.set('Content-Type', 'application/json')
    }

    const authToken = localStorage.getItem('authToken')
    if (authToken) {
      config.headers.set('Authorization', `Bearer ${authToken}`)
    }

    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

axiosInstance.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    if (
      error.response &&
      error.response.status === HTTP_STATUS.UNAUTHORIZED &&
      window.location.pathname !== '/login'
    ) {
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default axiosInstance
