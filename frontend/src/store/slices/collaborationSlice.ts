import { RoomSubmissionSummary } from './../../types/submissions'
import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { DEFAULT_LANGUAGE } from '../../constants/collaboration_editor.ts'

interface CollaborationState {
  selectedLanguage: string
  isCodeExecuting: boolean
  targetTranslatedLanguage: string | null
  translatedCode: string | null
  submissions: RoomSubmissionSummary[]
}

const initialState: CollaborationState = {
  selectedLanguage: DEFAULT_LANGUAGE,
  isCodeExecuting: false,
  targetTranslatedLanguage: null,
  translatedCode: null,
  submissions: [],
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
    },
    setTargetTranslatedLanguage: (
      state,
      action: PayloadAction<string | null>
    ) => {
      state.targetTranslatedLanguage = action.payload
    },
    setTranslatedCode: (state, action: PayloadAction<string | null>) => {
      state.translatedCode = action.payload
    },
    setSubmissions: (state, action: PayloadAction<RoomSubmissionSummary[]>) => {
      state.submissions = action.payload
    },
    addSubmission: (state, action: PayloadAction<RoomSubmissionSummary>) => {
      state.submissions.push(action.payload)
    },
  },
})

export const {
  setSelectedLanguage,
  setIsCodeExecuting,
  setTargetTranslatedLanguage,
  setTranslatedCode,
  setSubmissions,
  addSubmission,
} = collaborationSlice.actions
export default collaborationSlice.reducer
