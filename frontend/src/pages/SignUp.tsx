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
  Stack,
} from '@mui/material'
import { Link as RouterLink, useNavigate } from 'react-router-dom'
import { authService } from '../services/authService'
import {
  RegisterFormDataClient,
  RegisterResponse,
  UserSlice,
} from '../types/auth'
import { isAxiosError } from 'axios'
import { useDispatch } from 'react-redux'
import { loginSuccess } from '../store/slices/userSlice.ts'

const registerSchema = yup.object({
  full_name: yup
    .string()
    .required('Full name is required')
    .min(2, 'Full name must be at least 2 characters')
    .max(50, 'Full name must be less than 50 characters'),
  email: yup
    .string()
    .email('Please enter a valid email address')
    .required('Email is required'),
  password: yup
    .string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('password')], 'Passwords must match')
    .required('Please confirm your password'),
})

const SignUp = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<RegisterFormDataClient>({
    resolver: yupResolver(registerSchema),
    defaultValues: {
      full_name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  })

  const onSubmit: SubmitHandler<RegisterFormDataClient> = async (data) => {
    try {
      const { confirmPassword: _, ...registerData } = data

      const result: RegisterResponse = await authService.register(registerData)

      localStorage.setItem('authToken', result.token as string)
      dispatch(loginSuccess(result.user as UserSlice))
      navigate('/home')
    } catch (err) {
      if (isAxiosError(err)) {
        setError('root.serverError', {
          type: 'server',
          message:
            err.response?.data?.message ||
            'Registration failed. Please try again.',
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
        backgroundColor: 'background.default',
      }}
    >
      <Card
        sx={{
          width: 400,
          boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        <CardContent sx={{ p: 4 }}>
          <Box textAlign="center" mb={3}>
            <Typography
              variant="h4"
              fontWeight="bold"
              gutterBottom
              color="text.primary"
            >
              Create Account
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Join us today and get started
            </Typography>
          </Box>

          {errors.root?.serverError && (
            <Alert
              severity="error"
              sx={{
                mb: 2,
                borderRadius: 2,
              }}
            >
              {errors.root.serverError.message}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
            <Stack spacing={2}>
              <Controller
                name="full_name"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Full Name"
                    type="text"
                    size="small"
                    required
                    disabled={isSubmitting}
                    error={!!errors.full_name}
                    helperText={errors.full_name?.message}
                    sx={{
                      '& .MuiFormHelperText-root': {
                        marginTop: 0.5,
                        height: errors.full_name ? 'auto' : '0px',
                        overflow: 'hidden',
                      },
                    }}
                  />
                )}
              />

              <Controller
                name="email"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Email Address"
                    type="email"
                    size="small"
                    required
                    disabled={isSubmitting}
                    error={!!errors.email}
                    helperText={errors.email?.message}
                    sx={{
                      '& .MuiFormHelperText-root': {
                        marginTop: 0.5,
                        height: errors.email ? 'auto' : '0px',
                        overflow: 'hidden',
                      },
                    }}
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
                    size="small"
                    required
                    disabled={isSubmitting}
                    error={!!errors.password}
                    helperText={errors.password?.message}
                    sx={{
                      '& .MuiFormHelperText-root': {
                        marginTop: 0.5,
                        height: errors.password ? 'auto' : '0px',
                        overflow: 'hidden',
                      },
                    }}
                  />
                )}
              />

              <Controller
                name="confirmPassword"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Confirm Password"
                    type="password"
                    size="small"
                    required
                    disabled={isSubmitting}
                    error={!!errors.confirmPassword}
                    helperText={errors.confirmPassword?.message}
                    sx={{
                      '& .MuiFormHelperText-root': {
                        marginTop: 0.5,
                        height: errors.confirmPassword ? 'auto' : '0px',
                        overflow: 'hidden',
                      },
                    }}
                  />
                )}
              />

              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={isSubmitting}
                sx={{
                  mt: 1,
                  py: 1.5,
                  fontWeight: 'bold',
                  textTransform: 'none',
                  fontSize: '1rem',
                }}
                startIcon={isSubmitting ? <CircularProgress size={20} /> : null}
              >
                {isSubmitting ? 'Creating Account...' : 'Create Account'}
              </Button>
            </Stack>

            <Box textAlign="center" mt={3}>
              <Typography variant="body2" color="text.secondary">
                Already have an account?{' '}
                <Link
                  component={RouterLink}
                  to="/login"
                  underline="hover"
                  fontWeight="medium"
                >
                  Sign in
                </Link>
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  )
}

export default SignUp
