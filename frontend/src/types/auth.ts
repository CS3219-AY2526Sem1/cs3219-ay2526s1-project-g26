export type Role = 'user' | 'admin'

export interface LoginFormData {
  email: string
  password: string
}

export interface UserSlice {
  id: string
  email: string
  full_name: string
  role: Role
}

export interface LoginResponse {
  success: boolean
  token?: string
  user?: UserSlice
  message?: string
}

export interface RegisterFormData {
  email: string
  password: string
  full_name: string
}

export interface RegisterResponse {
  success: boolean
  token?: string
  message?: string
  user?: UserSlice
}

export interface UpdateProfileData {
  email: string
  full_name: string
  password: string
}

export interface GetProfileResponse {
  success: boolean
  user: Omit<UserSlice, 'role'>
}

export interface UpdateProfileForm {
  full_name: string
  email: string
  password?: string | undefined
  confirmPassword: string | undefined
}
