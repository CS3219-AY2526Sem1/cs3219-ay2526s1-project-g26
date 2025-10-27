import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { DEFAULT_LANGUAGE } from '../../constants/collaboration_editor.ts'
import { ExecuteCodeResponse } from '../../types/codeExecution.ts'

interface CollaborationState {
  selectedLanguage: string
  isCodeExecuting: boolean
  submissionResult: ExecuteCodeResponse | null
}

const initialState: CollaborationState = {
  selectedLanguage: DEFAULT_LANGUAGE,
  isCodeExecuting: false,
  submissionResult: null,
}

const collaborationSlice = createSlice({
  name: 'collaboration',
  initialState,
  reducers: {
    setSelectedLanguage: (state, action: PayloadAction<string>) => {
      state.selectedLanguage = action.payload
    },
    setIsCodeExecuting: (state, action: PayloadAction<boolean>) => {
      state.isCodeExecuting = action.payload
      if (action.payload) {
        state.submissionResult = null
      }
    },
    setSubmissionResult: (
      state,
      action: PayloadAction<ExecuteCodeResponse>
    ) => {
      state.submissionResult = action.payload
      state.isCodeExecuting = false
    },
  },
})

export const { setSelectedLanguage, setIsCodeExecuting, setSubmissionResult } =
  collaborationSlice.actions
export default collaborationSlice.reducer
