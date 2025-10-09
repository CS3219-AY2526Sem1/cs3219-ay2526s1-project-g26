import React, { useDispatch } from 'react-redux'
import { useForm, Controller, SubmitHandler } from 'react-hook-form'
import { Link as RouterLink, useNavigate } from 'react-router-dom'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { useEffect, useState } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Stack,
  Alert,
  CircularProgress,
  Link,
} from '@mui/material'
import { isAxiosError } from 'axios'
import { authService } from '../services/authService'
import { profileService } from '../services/profileService'
import LoadingSkeleton from '../components/common/LoadingSkeleton.tsx'
import { loginSuccess } from '../store/slices/userSlice'
import {
  RegisterFormDataClient,
  UpdateProfileData,
  UserSlice,
} from '../types/auth'
import userSchema from '../utils/userDetailsValidation'

const UpdateProfile = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(true)
  const [userData, setUserData] = useState<UserSlice | null>(null)

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
    reset,
  } = useForm<RegisterFormDataClient>({
    resolver: yupResolver(userSchema),
    defaultValues: {
      full_name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  })

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setIsLoading(true)
        const result = await authService.verifyToken()

        if (!result || !result.user) {
          // navigate('/login')
          return
        }
        setUserData(result.user)
        console.log(result.user)

        reset({
          full_name: result.user.full_name || '',
          email: result.user.email || '',
          password: '',
          confirmPassword: '',
        })
      } catch (error) {
        console.error('Error fetching user data:', error)
        navigate('/login')
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserData()
  }, [navigate, reset])

  const onSubmit: SubmitHandler<RegisterFormDataClient> = async (data) => {
    try {
      const profileData: UpdateProfileData = {
        id: userData?.id ?? '',
        email: data.email,
        full_name: data.full_name,
        password: data.password,
      }
      const result = await profileService.update(profileData)
      if (result.success) {
        localStorage.setItem('authToken', result.token as string)
        // Update user data state with new information
        setUserData(result.user ?? null)
        dispatch(loginSuccess(result.user as UserSlice))
        navigate('/home')
      }
    } catch (err) {
      if (isAxiosError(err)) {
        setError('root.serverError', {
          type: 'server',
          message:
            err.response?.data?.message || 'Update failed. Please try again.',
        })
      } else if (err instanceof yup.ValidationError) {
        // just catch the error here, nothing needs to be done
      }
      console.log(err)
    }
  }

  if (isLoading) {
    return <LoadingSkeleton />
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
              Edit Account Details
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Update your account information below
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
                    label="New Password"
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
                    label="Confirm New Password"
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
                {isSubmitting ? 'Updating Account...' : 'Update Account'}
              </Button>
            </Stack>

            <Box textAlign="center" mt={3}>
              <Typography variant="body2" color="text.secondary">
                Cancel changes?{' '}
                <Link
                  component={RouterLink}
                  to="/home"
                  underline="hover"
                  fontWeight="medium"
                >
                  Go back
                </Link>
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  )
}

export default UpdateProfile
