import axiosInstance from '../utils/axios.ts'
import { SubmissionDataResponse } from '../types/submissions.ts'
import { API_ENDPOINTS } from '../constants/api.ts'

export const submissionsService = {
  fetchSubmissions: async (
    page: number,
    limit: number
  ): Promise<SubmissionDataResponse> => {
    const response = await axiosInstance.get(
      `${API_ENDPOINTS.HISTORY.GET_USER_SUBMISSIONS}/${page}/${limit}`
    )
    return response.data.submissions
  },
}

export default submissionsService
