import axiosInstance from '../utils/axios.ts'
import {
  SubmissionDataResponse,
  SubmissionDetail,
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

  fetchSubmissionById: async (id: string): Promise<SubmissionDetail | null> => {
    try {
      const url = 'https://dummyjson.com/c/cee9-e073-40bb-bc51'
      const response = await axiosInstance.get<{
        mockSubmissionsData: SubmissionDetail[]
      }>(url)
      return (
        response.data.mockSubmissionsData.find(
          (sub) => sub.submission_id === id
        ) || null
      )
    } catch (error) {
      console.error('Error fetching submission details:', error)
      return null
    }
  },
}

export default submissionsService
