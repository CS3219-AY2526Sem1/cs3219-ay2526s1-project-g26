import axiosInstance from '../utils/axios.ts'
import { SubmissionDataSummary } from '../types/submissions.ts'
import { API_ENDPOINTS } from '../constants/api.ts'

export const submissionsService = {
  fetchSubmissions: async (
    userId: string,
    page: number,
    limit: number
  ): Promise<SubmissionDataSummary[]> => {
    const response = await axiosInstance.get(
      `${API_ENDPOINTS.HISTORY.GET_USER_SUBMISSIONS}/${userId}/${page}/${limit}`,
    )
    return response.data
  },
}

export default submissionsService
