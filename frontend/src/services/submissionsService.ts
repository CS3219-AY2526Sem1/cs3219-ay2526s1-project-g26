import axiosInstance from '../utils/axios.ts'
import {
  SubmissionDataSummary,
  SubmissionDetail,
} from '../types/submissions.ts'

export const submissionsService = {
  fetchSubmissions: async (
    page: number,
    limit: number
  ): Promise<SubmissionDataSummary[]> => {
    // to be replace with API call later
    // that also returns total number of submissions
    // and perhaps handling if none is found

    // note: custom response limit and skip is currently not implemented
    // https://github.com/Ovi/DummyJSON/pull/92
    // so switching between 3 urls conditionally for now

    let url
    if (page == 0) {
      url = 'https://dummyjson.com/c/230c-2155-4f03-8e62'
    } else if (page == 1) {
      url = 'https://dummyjson.com/c/4e14-34f4-4dac-af5f'
    } else {
      url = 'https://dummyjson.com/c/177d-5c63-4662-ab56'
    }
    const params = {
      limit: limit,
      skip: page,
    }

    const response = await axiosInstance.get<SubmissionDataSummary[]>(url, {
      params,
    })
    return response.data
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
