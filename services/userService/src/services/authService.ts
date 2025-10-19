import bcrypt from 'bcrypt'
import { User, UserRole } from '../models/userModel.js'
import pool from '../database/index.js'
import { AppError } from '../utils/errors.js'
import jwt, { JwtPayload, SignOptions } from 'jsonwebtoken'
import * as Config from '../config/index.js'

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

export const createUser = async (
  email: string,
  password: string,
  full_name?: string,
  role: UserRole = 'user'
): Promise<RegisterResponse> => {
  const password_hash = await bcrypt.hash(password, 10)

  try {
    // identical to yup internal regex in frontend
    const emailRegex =
      /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/
    const passwordRegex =
      /^(?=.*[a-z].*)(?=.*[A-Z].*)(?=.*\d.*)(?=.*[!-,:-@[-`{-~].*)[!-~]{8,}$/

    if (
      !email ||
      !emailRegex.test(email) ||
      !password ||
      !isValidPassword(password)
    ) {
      throw new AppError(
        'Invalid email or password, please apply validation before sending',
        400
      )
    }

    const result = await pool.query<User>(
      `INSERT INTO users (email, password_hash, full_name, role)
       VALUES ($1, $2, $3, $4) RETURNING id, email, full_name, role`,
      [email, password_hash, full_name, role]
    )

    const payload = {
      id: result.rows[0].id,
      email: result.rows[0].email,
      role: result.rows[0].role,
      full_name: result.rows[0].full_name,
    }
    const token = jwt.sign(payload, Config.JWT_SECRET, {
      expiresIn: Config.JWT_EXPIRES_IN,
    } as SignOptions)

    return { token, user: result.rows[0] }

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
}

interface RegisterResponse {
  token: string
  user: User
}

interface LoginResponse {
  token: string
  user: { id: string; email: string; role: UserRole; full_name: string }
}

export const loginUser = async (
  email: string,
  password: string
): Promise<LoginResponse> => {
  const result = await pool.query<User>(
    'SELECT id, email, role, password_hash, full_name FROM users WHERE email = $1',
    [email]
  )
  const user = result.rows[0]

  if (!user) {
    throw new AppError('Invalid email or password', 401)
  }

  const isMatch = await bcrypt.compare(password, user.password_hash)
  if (!isMatch) {
    throw new AppError('Invalid email or password', 401)
  }

  const payload = {
    id: user.id,
    email: user.email,
    role: user.role,
    full_name: user.full_name,
  }
  const token = jwt.sign(payload, Config.JWT_SECRET, {
    expiresIn: Config.JWT_EXPIRES_IN,
  } as SignOptions)

  return { token, user: payload }
}

export const decodeToken = (token: string): JwtPayload => {
  try {
    return jwt.verify(token, Config.JWT_SECRET) as JwtPayload
  } catch (_err) {
    throw new AppError('Invalid or expired token', 401)
  }
}
