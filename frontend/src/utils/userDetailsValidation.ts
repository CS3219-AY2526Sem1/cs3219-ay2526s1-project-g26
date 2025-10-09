import * as yup from 'yup'

const userSchema = yup.object({
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
    .min(8, 'Password must be at least 8 characters')
    .test(
      'password-strength',
      'Password must contain at least 1 uppercase, lowercase, number, and special character',
      (value) => {
        const hasUpperCase = /[A-Z]/.test(value)
        const hasLowerCase = /[a-z]/.test(value)
        const hasNumber = /[0-9]/.test(value)
        // Space not included in special characters!
        const hasASCIISpecial = /[!-,:-@[-`{-~]/.test(value)
        return hasUpperCase && hasLowerCase && hasNumber && hasASCIISpecial
      }
    )
    .required('Password is required'),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('password')], 'Passwords must match')
    .required('Please confirm your password'),
})

export default userSchema
