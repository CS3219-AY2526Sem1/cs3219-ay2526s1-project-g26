import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { UserSlice } from '../../types/auth.ts'

interface UserState {
  user: UserSlice | null
  isAuthenticated: boolean
}

const initialState: UserState = {
  user: null,
  isAuthenticated: false,
}

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    loginSuccess: (state, action: PayloadAction<UserSlice>) => {
      state.isAuthenticated = true
      state.user = action.payload
    },
    logout: (state) => {
      state.user = null
      state.isAuthenticated = false
    },
    updateUser: (state, action: PayloadAction<Partial<UserSlice>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload }
      }
    },
  },
})

export const { loginSuccess, logout, updateUser } = userSlice.actions

export default userSlice.reducer
