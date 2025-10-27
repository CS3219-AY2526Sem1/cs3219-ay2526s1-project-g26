import axiosInstance from '../utils/axios'
import { API_ENDPOINTS } from '../constants/api'
import {
  ExecuteCodeRequest,
  ExecuteCodeResponse,
} from '../types/codeExecution.ts'

export const codeExecutionService = {
  executeCode: async (
    request: ExecuteCodeRequest
  ): Promise<ExecuteCodeResponse> => {
    const response = await axiosInstance.post(
      API_ENDPOINTS.CODE_EXECUTION.EXECUTE,
      request
    )
    return response.data.result
  },
}

export default codeExecutionService
