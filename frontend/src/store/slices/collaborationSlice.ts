import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { DEFAULT_LANGUAGE } from '../../constants/collaboration_editor.ts'
import { Question } from '../../types/question.ts'

interface CollaborationState {
  selectedLanguage: string
  currentQuestion?: Question | null
}

const initialState: CollaborationState = {
  selectedLanguage: DEFAULT_LANGUAGE,
  currentQuestion: null,
}

const collaborationSlice = createSlice({
  name: 'collaboration',
  initialState,
  reducers: {
    setSelectedLanguage: (state, action: PayloadAction<string>) => {
      state.selectedLanguage = action.payload
    },
    setCurrentQuestion: (state, action: PayloadAction<Question | null>) => {
      state.currentQuestion = action.payload
    },
  },
})

export const { setSelectedLanguage, setCurrentQuestion } =
  collaborationSlice.actions
export default collaborationSlice.reducer
