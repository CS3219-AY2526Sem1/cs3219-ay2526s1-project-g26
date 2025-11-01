import bcrypt from 'bcrypt'
import { User, UserRole } from '../models/userModel.js'
import pool from '../database/index.js'
import { AppError } from '../utils/errors.js'
import jwt, { JwtPayload, SignOptions } from 'jsonwebtoken'
import * as Config from '../config/index.js'
import crypto from 'crypto'
import { sendEmail } from '../utils/email.js'

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

export const requestPasswordReset = async (email: string): Promise<boolean> => {
  // 1. 检查用户是否存在
  const userResult = await pool.query('SELECT id FROM users WHERE email = $1', [
    email,
  ])
  if (userResult.rows.length === 0) {
    // 邮箱不存在也返回 true，防止泄露用户信息
    return true
  }

  const userId = userResult.rows[0].id

  // 2. 生成随机 6 位数字 OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString()

  // 3. 对 OTP 进行哈希处理（防止数据库泄露时暴露验证码）
  const otpHash = await bcrypt.hash(otp, 10)

  // 4. 设置过期时间（10分钟）
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000)

  // 5. 插入数据库
  await pool.query(
    `INSERT INTO password_reset_tokens (user_id, token_hash, expires_at)
     VALUES ($1, $2, $3)`,
    [userId, otpHash, expiresAt]
  )

  // 6. 发送邮件（使用 nodemailer）
  await sendEmail(
    email,
    'Password Reset Code',
    `Your OTP code is: ${otp}. It will expire in 10 minutes.`
  )

  return true
}

export const resetPassword = async (
  email: string,
  code: string,
  newPassword: string
): Promise<boolean> => {
  // 1. 找到对应用户
  const userResult = await pool.query('SELECT id FROM users WHERE email = $1', [
    email,
  ])
  if (userResult.rows.length === 0) {
    throw new AppError('Invalid email', 400)
  }
  const userId = userResult.rows[0].id

  // 2. 查找最近的未使用且未过期的 OTP
  const tokenResult = await pool.query(
    `SELECT id, token_hash, expires_at, used
     FROM password_reset_tokens
     WHERE user_id = $1
     ORDER BY created_at DESC
     LIMIT 1`,
    [userId]
  )

  if (tokenResult.rows.length === 0) {
    throw new AppError('No reset code found or expired', 400)
  }

  const tokenRow = tokenResult.rows[0]

  if (tokenRow.used) {
    throw new AppError('This code has already been used', 400)
  }

  if (new Date(tokenRow.expires_at) < new Date()) {
    throw new AppError('This code has expired', 400)
  }

  // 3. 验证用户输入的 OTP 与数据库中的 hash 是否匹配
  const isValid = await bcrypt.compare(code, tokenRow.token_hash) // ✅ 新增
  if (!isValid) {
    throw new AppError('Invalid reset code', 400)
  }

  // 4. 更新用户密码
  const hashedPassword = await bcrypt.hash(newPassword, 10) // ✅ 新增
  await pool.query('UPDATE users SET password_hash = $1 WHERE id = $2', [
    hashedPassword,
    userId,
  ])

  // 5. 标记该 OTP 已使用
  await pool.query(
    'UPDATE password_reset_tokens SET used = TRUE WHERE id = $1',
    [tokenRow.id]
  )

  return true
}
