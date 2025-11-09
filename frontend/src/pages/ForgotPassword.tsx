import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
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
  Collapse,
} from '@mui/material'
import { AxiosError } from 'axios'
import * as yup from 'yup'

// Helper function to format seconds into mm:ss
const formatTime = (seconds: number) => {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds
    .toString()
    .padStart(2, '0')}`
}

const newPasswordSchema = yup
  .string()
  .required('New password is required')
  .test(
    'password-requirements',
    'Password must be at least 8 characters and contain an uppercase, lowercase, number, and special character',
    (value) => {
      // The .required() check ensures 'value' is not null/undefined
      if (!value) return false // Failsafe

      const hasUpperCase = /[A-Z]/.test(value)
      const hasLowerCase = /[a-z]/.test(value)
      const hasNumber = /[0-9]/.test(value)
      const hasASCIISpecial = /[!-,:-@[-`{-~]/.test(value) // Space not included
      const hasMinLength = value.length >= 8

      return (
        hasUpperCase &&
        hasLowerCase &&
        hasNumber &&
        hasASCIISpecial &&
        hasMinLength
      )
    }
  )

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [newPassword, setNewPassword] = useState('')

  const [message, setMessage] = useState('')
  const [severity, setSeverity] = useState<'success' | 'error'>('error')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isOtpSent, setIsOtpSent] = useState(false)

  const [resendCooldown, setResendCooldown] = useState(0)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  const navigate = useNavigate()

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [])

  const startCooldownTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
    }

    setResendCooldown(60) // 10 minutes in seconds

    timerRef.current = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!)
          return 0 // Stop timer
        }
        return prev - 1 // Decrement
      })
    }, 1000)
  }

  const handleRequestOtp = async () => {
    setIsSubmitting(true)
    setMessage('')
    try {
      const res = await authService.forgotPassword(email)
      setMessage(res.message)

      if (res.success) {
        setSeverity('success')
        setIsOtpSent(true)
        startCooldownTimer() // <-- Start the timer on success
      } else {
        setSeverity('error')
      }
    } catch (err) {
      setSeverity('error')
      if (err instanceof AxiosError) {
        setMessage(
          err.response?.data?.message || 'Request failed. Please try again.'
        )
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleResetPassword = async () => {
    setMessage('')
    try {
      await newPasswordSchema.validate(newPassword)
    } catch (err) {
      if (err instanceof yup.ValidationError) {
        setSeverity('error')
        setMessage(err.message) // Set the validation error message
        return // Stop the function
      }
    }

    setIsSubmitting(true)
    try {
      const res = await authService.resetPassword({ email, code, newPassword })
      setMessage(res.message)

      if (res.success) {
        setSeverity('success')
        if (timerRef.current) {
          clearInterval(timerRef.current)
        }
        setTimeout(() => {
          navigate('/login', {
            state: { message: 'Password reset successful. Please login.' },
          })
        }, 1500)
      } else {
        setSeverity('error')
      }
    } catch (err) {
      setSeverity('error')
      if (err instanceof AxiosError) {
        setMessage(
          err.response?.data?.message ||
            'Failed to reset password. Please try again.'
        )
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (isOtpSent) {
      handleResetPassword()
    } else {
      handleRequestOtp()
    }
  }

  const buttonText = isOtpSent ? 'Reset Password' : 'Send OTP'
  const loadingText = isOtpSent ? 'Resetting...' : 'Sending...'

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
            {isOtpSent ? 'Reset Password' : 'Forgot Password'}
          </Typography>

          {message && (
            <Alert
              severity={severity}
              sx={{
                mb: 2,
                wordBreak: 'break-word',
              }}
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
              disabled={isSubmitting || isOtpSent}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <Collapse in={isOtpSent}>
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

              {/* --- NEW RESEND BLOCK --- */}
              <Box sx={{ mt: 1, mb: 1, textAlign: 'right' }}>
                {resendCooldown > 0 ? (
                  <Typography variant="body2" color="text.secondary">
                    Resend code in {formatTime(resendCooldown)}
                  </Typography>
                ) : (
                  <Button
                    variant="text"
                    size="small"
                    onClick={handleRequestOtp} // Calls the same request function
                    disabled={isSubmitting}
                  >
                    Resend OTP
                  </Button>
                )}
              </Box>
              {/* --- END OF NEW BLOCK --- */}

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
            </Collapse>

            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              sx={{ mt: 2 }}
              disabled={isSubmitting}
              startIcon={isSubmitting ? <CircularProgress size={20} /> : null}
            >
              {isSubmitting ? loadingText : buttonText}
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  )
}
