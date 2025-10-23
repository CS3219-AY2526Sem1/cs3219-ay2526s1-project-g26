import axiosInstance from '../utils/axios.ts'
import {
  SubmissionDataResponse,
  SubmissionDetailResponse,
} from '../types/submissions.ts'
import { API_ENDPOINTS } from '../constants/api.ts'

export const submissionsService = {
  fetchSubmissions: async (
    page: number,
    limit: number
  ): Promise<SubmissionDataResponse> => {
    const response = await axiosInstance.get(
      `${API_ENDPOINTS.HISTORY.GET_USER_SUBMISSIONS}`,
      {
        params: {
          page,
          limit,
        },
      }
    )
    return response.data.submissions
  },

  fetchSubmissionById: async (id: string): Promise<SubmissionDetailResponse> => {
    const response = await axiosInstance.get(
      `${API_ENDPOINTS.HISTORY.GET_SUBMISSION_BY_ID}${id}`
    )
    return response.data.submission
  },
}

export default submissionsService
