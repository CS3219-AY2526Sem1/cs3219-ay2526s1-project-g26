import axiosInstance from '../utils/axios.ts'
import { API_ENDPOINTS } from '../constants/api'
import {
  UpdateProfileData,
  UserSlice,
  GetProfileResponse,
} from '../types/auth.ts'

export const profileService = {
  getUserProfile: async (): Promise<Omit<UserSlice, 'role'>> => {
    const response = await axiosInstance.get<GetProfileResponse>(
      API_ENDPOINTS.PROFILE.GET
    )
    return response.data.user
  },
  update: async (credentials: UpdateProfileData): Promise<void> => {
    await axiosInstance.put<void>(API_ENDPOINTS.PROFILE.UPDATE, credentials)
  },
}

export default profileService
