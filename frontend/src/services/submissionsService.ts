import axiosInstance from '../utils/axios.ts'
import {
  SubmissionDataResponse,
  SubmissionDetail,
  SubmissionDetail2,
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

  fetchSubmissionById: async (id: string): Promise<SubmissionDetail> => {
    const response = await axiosInstance.get(
      `${API_ENDPOINTS.HISTORY.GET_SUBMISSION_BY_ID}${id}`
    )
    return response.data.submission
  },

  getSubmissionStatusByTicketId: async (
    ticketId: string
  ): Promise<{ success: boolean; result: SubmissionDetail2 } | null> => {
    const response = await axiosInstance.get(
      `${API_ENDPOINTS.HISTORY.GET_SUBMISSION_STATUS_WITH_TICKET}/${ticketId}`
    )
    if (response.status === 202) {
      return null
    } else {
      return response.data.result
    }
  },
}

export default submissionsService
