import bcrypt from 'bcrypt'
import { User, UserRole } from '../models/userModel.js'
import pool from '../database/index.js'
import { AppError } from '../utils/errors.js'
import jwt, { JwtPayload, SignOptions } from 'jsonwebtoken'
import * as Config from '../config/index.js'

export const createUser = async (
  email: string,
  password: string,
  full_name?: string,
  role: UserRole = 'user'
): Promise<User> => {
  const password_hash = await bcrypt.hash(password, 10)

  try {
    const result = await pool.query<User>(
      `INSERT INTO users (email, password_hash, full_name, role)
       VALUES ($1, $2, $3, $4) RETURNING id, email, full_name, role`,
      [email, password_hash, full_name, role]
    )

    return result.rows[0]

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

export const requestPasswordReset = async (email: string): Promise<boolean> => {
  const result = await pool.query('SELECT id FROM users WHERE email = $1', [email])
  return result.rows.length > 0
}

export const resetPassword = async (
  email: string,
  code: string,
  newPassword: string
): Promise<boolean> => {
  // temporarily the OTP is fixed 1234
  if (code !== '1234') {
    return false
  }

  const hashed = await bcrypt.hash(newPassword, 10)
  const result = await pool.query(
    'UPDATE users SET password_hash = $1 WHERE email = $2',
    [hashed, email]
  )
  return result.rowCount > 0
}
