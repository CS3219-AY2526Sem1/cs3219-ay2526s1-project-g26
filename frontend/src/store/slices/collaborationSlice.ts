import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { DEFAULT_LANGUAGE } from '../../constants/collaboration_editor.ts'

interface CollaborationState {
  selectedLanguage: string
}

const initialState: CollaborationState = {
  selectedLanguage: DEFAULT_LANGUAGE,
}

const collaborationSlice = createSlice({
  name: 'collaboration',
  initialState,
  reducers: {
    setSelectedLanguage: (state, action: PayloadAction<string>) => {
      state.selectedLanguage = action.payload
    },
  },
})

export const { setSelectedLanguage } = collaborationSlice.actions
export default collaborationSlice.reducer
