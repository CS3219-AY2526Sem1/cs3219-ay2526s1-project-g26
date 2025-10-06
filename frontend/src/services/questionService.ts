import axiosInstance from '../utils/axios'
import { API_ENDPOINTS } from '../constants/api'

export interface Question {
  id: number
  title: string
  description: string
  difficulty: string
  constraints?: string[]
  examples?: Array<{
    input: string
    output: string
  }>
  hints?: string[]
  input?: string
  output?: string
}


export const questionService = { 

  getQuestionById: async (id: number): Promise<Question> => {
    // 临时：强制使用模拟数据进行测试
    const USE_MOCK_DATA = true // 改为 true 可以使用模拟数据
    
    if (USE_MOCK_DATA) {
      console.log('Using mock data...')
      return {
        id: 1,
        title: 'Two Sum',
        description: 'Given an array of integers `nums` of length `n`, and an integer `target`, return the smallest indices of the two numbers such that they add up to target.\n\nYou may not use the same element twice.',
        difficulty: 'easy',
        constraints: ['You must implement a solution with better than O(n^2) time complexity.'], 
        examples: [
          {
            input: "4 9\n2 7 11 15",
            output: "0 1"
          },
          {
            input: "3 6\n3 2 4", 
            output: "1 2"
          }
        ],
        hints: [
          'A really brute force way would be to search for all possible pairs of numbers but that would be too slow. Again, it is best to try out brute force solutions just for completeness. It is from these brute force solutions that you can come up with optimizations.'
        ],
        input: 'The first line contains two integers `n` and `target`. The second line contains `n` integers giving the elements in `nums`.',
        output: 'Two integers that are the smallest indices. Output `-1 -1` if there no answer.'
      }
    }
    
    try {
      const response = await axiosInstance.get(`${API_ENDPOINTS.QUESTION.BY_ID}/${id}`)
      console.log('Raw API response:', response.data.question)
      return response.data.question
    } catch (error) {

      console.error('API call failed:', error)
      throw error
    }
  },

}

export default questionService