import React from 'react'
import { useForm, Controller, SubmitHandler, Resolver } from 'react-hook-form'
import { Link as RouterLink, useNavigate } from 'react-router-dom'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { useState } from 'react'
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
import { profileService } from '../services/profileService'
import LoadingSkeleton from '../components/common/LoadingSkeleton.tsx'
import { UpdateProfileData, UpdateProfileForm } from '../types/auth'
import userSchema from '../utils/userDetailsValidation'
import useAsyncEffect from '../hooks/useAsyncEffect.ts'

const UpdateProfile = () => {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(true)

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
    reset,
  } = useForm<UpdateProfileForm>({
    resolver: yupResolver(userSchema) as Resolver<UpdateProfileForm>,
    defaultValues: {
      full_name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  })

  // Not placed under Signup and Home in App.tsx to avoid duplicate work
  useAsyncEffect(async () => {
    try {
      setIsLoading(true)
      const result = await profileService.getUserProfile()

      reset({
        full_name: result.full_name || '',
        email: result.email || '',
        password: '',
        confirmPassword: '',
      })
    } catch (_error) {
      /** empty */
    } finally {
      setIsLoading(false)
    }
  }, [navigate, reset])

  const onSubmit: SubmitHandler<UpdateProfileForm> = async (data) => {
    try {
      const profileData: UpdateProfileData = {
        email: data.email,
        full_name: data.full_name,
        password: data.password || '',
      }
      await profileService.update(profileData)
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
