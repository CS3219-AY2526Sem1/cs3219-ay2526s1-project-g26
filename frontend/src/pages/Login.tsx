import React from 'react'
import { useForm, Controller, SubmitHandler } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import {
  Box,
  Card,
  CardContent,
  TextField,
  Typography,
  Button,
  Link,
  Alert,
  CircularProgress,
} from '@mui/material'
import { LoginFormData, LoginResponse } from '../types/auth.ts'
import authService from '../services/authService.ts'
import { useNavigate } from 'react-router-dom'
import { isAxiosError } from 'axios'
import { useDispatch } from 'react-redux'
import { loginSuccess } from '../store/slices/userSlice.ts'
import { UserSlice } from '../types/auth.ts'

const loginSchema = yup.object({
  email: yup
    .string()
    .email('Invalid email format')
    .required('Email is required'),
  password: yup
    .string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
})

const Login = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<LoginFormData>({
    resolver: yupResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const onSubmit: SubmitHandler<LoginFormData> = async (data) => {
    try {
      const result: LoginResponse = await authService.login(data)
      if (result.token) {
        localStorage.setItem('authToken', result.token)
      }
      dispatch(loginSuccess(result.user as UserSlice))
      navigate('/home')
    } catch (err) {
      if (isAxiosError(err)) {
        setError('root.serverError', {
          type: 'server',
          message:
            err.response?.data?.message || 'Login failed. Please try again.',
        })
      }
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
            Welcome back
          </Typography>

          {errors.root?.serverError && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {errors.root.serverError.message}
            </Alert>
          )}

          <Box
            component="form"
            onSubmit={handleSubmit(onSubmit)}
            sx={{ mt: 2 }}
            noValidate
          >
            <Controller
              name="email"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Email address"
                  type="email"
                  fullWidth
                  margin="normal"
                  required
                  disabled={isSubmitting}
                  error={!!errors.email}
                  helperText={errors.email?.message}
                />
              )}
            />

            <Controller
              name="password"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Password"
                  type="password"
                  fullWidth
                  margin="normal"
                  required
                  disabled={isSubmitting}
                  error={!!errors.password}
                  helperText={errors.password?.message}
                />
              )}
            />

            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                mt: 1,
              }}
            >
              <Link
                component="button"
                variant="body2"
                onClick={() => navigate('/forgot-password')}
                underline="hover"
              >
                Forgot password?
              </Link>
            </Box>

            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              sx={{ mt: 3, mb: 2 }}
              disabled={isSubmitting}
              startIcon={isSubmitting ? <CircularProgress size={20} /> : null}
            >
              {isSubmitting ? 'Signing In...' : 'Sign In'}
            </Button>

            <Typography
              variant="body2"
              color="text.secondary"
              align="center"
              sx={{ mt: 2 }}
            >
              Don&apos;t have an account?{' '}
              <Link href="/signup" underline="hover">
                Sign up
              </Link>
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  )
}

export default Login
