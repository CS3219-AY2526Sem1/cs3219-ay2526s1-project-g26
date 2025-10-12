import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { type AlertColor } from '@mui/material'

export interface NotificationSnackbarState {
  open: boolean
  message: string
  severity: AlertColor
}

const initialState = {
  open: false,
  message: '',
  severity: 'success',
}

const notificationSnackbarSlice = createSlice({
  name: 'notificationSnackbar',
  initialState,
  reducers: {
    setOpen: (
      state,
      action: PayloadAction<Omit<NotificationSnackbarState, 'open'>>
    ) => {
      state.open = true
      state.message = action.payload.message
      state.severity = action.payload.severity
    },
    setClose: (state, _action: PayloadAction<void>) => {
      state.open = false
    },
  },
})

export const { setOpen, setClose } = notificationSnackbarSlice.actions

export default notificationSnackbarSlice.reducer
