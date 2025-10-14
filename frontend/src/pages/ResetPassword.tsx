import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import authService from '../services/authService'
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
} from '@mui/material'

interface LocationState {
  email?: string
}

export default function ResetPassword() {
  const navigate = useNavigate()
  const location = useLocation()
  const state = location.state as LocationState

  const [email, setEmail] = useState(state?.email || '')
  const [code, setCode] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setMessage('')

    try {
      const res = await authService.resetPassword({ email, code, newPassword })
      setMessage(res.message)

      if (res.success) {
        // 重置成功后跳转到登录页
        setTimeout(() => {
          navigate('/login', {
            state: { message: 'Password reset successful. Please login.' },
          })
        }, 1500) // 延迟 1.5s 让用户看到提示
      }
    } catch (err: any) {
      setMessage(
        err.response?.data?.message ||
          'Failed to reset password. Please try again.'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: '#f5f5f5',
      }}
    >
      <Card sx={{ minWidth: 400, p: 3 }}>
        <CardContent>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Reset Password
          </Typography>

          {message && (
            <Alert
              severity={message.includes('success') ? 'success' : 'error'}
              sx={{ mb: 2 }}
            >
              {message}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} noValidate>
            <TextField
              label="Email"
              type="email"
              fullWidth
              margin="normal"
              required
              disabled={isSubmitting}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <TextField
              label="OTP"
              type="text"
              fullWidth
              margin="normal"
              required
              disabled={isSubmitting}
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />

            <TextField
              label="New Password"
              type="password"
              fullWidth
              margin="normal"
              required
              disabled={isSubmitting}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />

            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              sx={{ mt: 2 }}
              disabled={isSubmitting}
              startIcon={isSubmitting ? <CircularProgress size={20} /> : null}
            >
              {isSubmitting ? 'Resetting...' : 'Reset Password'}
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  )
}
