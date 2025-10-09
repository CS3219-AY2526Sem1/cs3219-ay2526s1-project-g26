import axiosInstance from '../utils/axios.ts'
import { API_ENDPOINTS } from '../constants/api'
import { UpdateProfileData, UpdateProfileResponse } from '../types/auth.ts'

export const profileService = {
  update: async (
    credentials: UpdateProfileData
  ): Promise<UpdateProfileResponse> => {
    const response = await axiosInstance.put<UpdateProfileResponse>(
      API_ENDPOINTS.PROFILE.UPDATE,
      credentials
    )
    return response.data
  },
}

export default profileService
