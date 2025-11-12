import bcrypt from 'bcrypt'
import { User } from '../models/userModel.js'
import pool from '../database/index.js'
import { AppError } from '../utils/errors.js'
import { getLogger } from '../utils/logger.js'

const logger = getLogger('profileService')

export const getUserProfile = async (id: string | undefined) => {
  if (!id) {
    logger.error('Unexpected JWT schema. Missing id.')
    throw new Error()
  }

  const result = await pool.query<User>(
    `SELECT email, full_name
     FROM users
     WHERE id = $1;`,
    [id]
  )

  if (!result || result.rows.length === 0) {
    throw new AppError('User not found', 404)
  }

  return result.rows[0]
}

const isValidPassword = (password: string): boolean => {
  if (password.length < 8 || password.length > 128) return false

  // Check each requirement separately to avoid nested quantifiers
  const hasLowercase = /[a-z]/.test(password)
  const hasUppercase = /[A-Z]/.test(password)
  const hasDigit = /[0-9]/.test(password)
  const hasSpecial = /[!-,:-@[-`{-~]/.test(password)
  const validChars = /^[!-~]+$/.test(password)

  return hasLowercase && hasUppercase && hasDigit && hasSpecial && validChars
}

export const updateUserProfile = async (
  id: string,
  email: string,
  password: string,
  full_name: string
): Promise<void> => {
  // identical to yup internal regex in frontend
  const emailRegex =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/

  if (!emailRegex.test(email)) {
    throw new AppError(
      'Invalid email or password, please apply validation before sending',
      400
    )
  } else if (password && !isValidPassword(password)) {
    throw new AppError(
      'Invalid email or password, please apply validation before sending',
      400
    )
  }

  let result
  try {
    if (password) {
      const password_hash = await bcrypt.hash(password, 10)
      result = await pool.query<User>(
        `UPDATE users
         SET email         = $1,
             password_hash = $2,
             full_name     = $3
         WHERE id = $4;`,
        [email, password_hash, full_name, id]
      )
    } else {
      result = await pool.query<User>(
        `UPDATE users
         SET email     = $1,
             full_name = $2
         WHERE id = $3;`,
        [email, full_name, id]
      )
    }
    // TODO: fix the following
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    if (err.code === '23505') {
      if (err.detail.includes('email')) {
        throw new AppError('Email already exists', 400)
      }
      if (err.detail.includes('full_name')) {
        throw new AppError('Full name already exists', 400)
      }
    }
    throw new AppError(err.message, 500)
  }

  console.log(result)
  if (!result || result.rowCount == 0) {
    throw new AppError('User not found', 404)
  }
}
