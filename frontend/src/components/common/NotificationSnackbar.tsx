import React, { memo } from 'react'
import { Snackbar, Alert } from '@mui/material'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '../../store'
import {
  NotificationSnackbarState,
  setClose,
} from '../../store/slices/notificationSnackbarSlice.ts'

const NotificationSnackbar = () => {
  const dispatch = useDispatch()
  const { open, message, severity } = useSelector(
    (state: RootState) => state.notificationSnackbar
  ) as NotificationSnackbarState

  return (
    <Snackbar
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      open={open}
      onClose={(_e) => void dispatch(setClose())}
      message={message}
      autoHideDuration={2000}
    >
      <Alert
        onClose={(_e) => void dispatch(setClose())}
        severity={severity}
        variant="filled"
        sx={{ width: '100%' }}
      >
        {message}
      </Alert>
    </Snackbar>
  )
}

export default memo(NotificationSnackbar)
