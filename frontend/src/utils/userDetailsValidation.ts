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
    .test(
      'password-requirements',
      'Password must be at least 8 characters and contain an uppercase, lowercase, number, and special character',
      (value) => {
        if (!value) {
          return true
        }
        // If a password IS provided, it must meet all criteria.
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
    ),
  confirmPassword: yup.string().when('password', {
    is: (password: string | undefined) => password && password.length > 0,
    then: (schema) =>
      schema
        .oneOf([yup.ref('password')], 'Passwords must match')
        .required('Please confirm your password'),
    otherwise: (schema) => schema.notRequired(),
  }),
})

export default userSchema
