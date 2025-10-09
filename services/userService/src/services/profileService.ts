import bcrypt from 'bcrypt'
import { User, UserRole } from '../models/userModel.js'
import pool from '../database/index.js'
import { AppError } from '../utils/errors.js'
import jwt, { SignOptions } from 'jsonwebtoken'
import * as Config from '../config/index.js'

export const updateUserProfile = async (
  id: string,
  email: string,
  password: string,
  full_name?: string
): Promise<LoginResponse> => {
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
      !passwordRegex.test(password)
    ) {
      throw new AppError(
        'Invalid email or password, please apply validation before sending',
        400
      )
    }

    const result = await pool.query<User>(
      `UPDATE users SET email = $1, password_hash = $2, full_name = $3 WHERE id = $4
       RETURNING id, email, full_name, role`,
      [email, password_hash, full_name, id]
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

    return { token, user: payload }

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
