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
    try {
      const response = await axiosInstance.get(`${API_ENDPOINTS.QUESTION.BY_ID}/${id}`)
      console.log('Raw API response:', response.data.question)
      return response.data.question
    } catch (error) {
      console.error('API call failed:', error)
      throw error
    }
  },

  // 获取随机问题（使用固定ID为例）
  getRandomQuestion: async (difficulty: string = 'easy'): Promise<Question> => {
    try {
      // 暂时使用固定ID 1，之后可以随机生成
      return await questionService.getQuestionById(1)
    } catch (error) {
      // console.error('API call failed, using mock data:', error)
      // // 临时返回模拟数据，匹配数据库实际结构
      // return {
      //   id: 1,
      //   title: 'Two Sum',
      //   description: 'Given an array of integers `nums` of length `n`, and an integer `target`, return the smallest indices of the two numbers such that they add up to target.\n\nYou may not use the same element twice.',
      //   difficulty: difficulty,
      //   constraints: [], // 数据库中是空数组
      //   examples: [
      //     {
      //       input: "4 9\n2 7 11 15",
      //       output: "0 1"
      //     },
      //     {
      //       input: "3 6\n3 2 4", 
      //       output: "1 2"
      //     }
      //   ],
      //   hints: [
      //     'A really brute force way would be to search for all possible pairs of numbers but that would be too slow. Again, it is best to try out brute force solutions just for completeness. It is from these brute force solutions that you can come up with optimizations.'
      //   ],
      //   input: 'The first line contains two integers `n` and `target`. The second line contains `n` integers giving the elements in `nums`.',
      //   output: 'Two integers that are the smallest indices. Output `-1 -1` if there no answer.'
      // }
      console.error('API call failed:', error)
      // 抛出错误而不是返回模拟数据
      throw error
    }
  }
}

export default questionService