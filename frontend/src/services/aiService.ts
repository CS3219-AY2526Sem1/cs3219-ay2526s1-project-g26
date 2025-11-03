import axiosInstance from '../utils/axios.ts'
import { API_ENDPOINTS } from '../constants/api'

import { CodeTranslationResponse } from '../types/codeTranslation.ts'

export const authService = {
  translateCode: async (
    fromLang: string,
    toLang: string,
    code: string
  ): Promise<string> => {
    const response = await axiosInstance.post<CodeTranslationResponse>(
      API_ENDPOINTS.AI.CODE_TRANSLATE,
      {
        from_lang: fromLang,
        to_lang: toLang,
        code: code,
      }
    )
    return response.data.data
  },
}

export default authService
