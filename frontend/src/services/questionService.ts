import axiosInstance from '../utils/axios'
import { API_ENDPOINTS } from '../constants/api'
import { Question } from '../types/question.ts'

export const questionService = {
  getQuestionById: async (id: string): Promise<Question> => {
    try {
      const response = await axiosInstance.get(
        `${API_ENDPOINTS.QUESTION.GET_BY_ID}/${id}`
      )
      console.log('Raw API response:', response.data.question)
      return response.data.question
    } catch (error) {
      console.error('API call failed:', error)
      throw error
    }
  },
}

export default questionService
