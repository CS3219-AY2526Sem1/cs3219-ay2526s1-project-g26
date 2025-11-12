import bcrypt from 'bcrypt'
import { User, UserRole } from '../models/userModel.js'
import pool from '../database/index.js'
import { AppError } from '../utils/errors.js'
import jwt, { JwtPayload, SignOptions } from 'jsonwebtoken'
import * as Config from '../config/index.js'
import { sendEmail } from '../utils/email.js'
import redisClient from '../database/redis.js'

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

// Define a consistent key prefix for Redis
const RESET_KEY_PREFIX = 'password-reset:'
// Set expiration time in seconds (10 minutes)
const OTP_EXPIRATION_SECONDS = 10 * 60

/**
 * Generates an OTP, sends it via email, and stores the HASH in Redis.
 */
export const requestPasswordReset = async (email: string): Promise<boolean> => {
  // 1. Check if user exists (this is still a good practice)
  const userResult = await pool.query('SELECT id FROM users WHERE email = $1', [
    email,
  ])
  if (userResult.rows.length === 0) {
    // Return true to prevent email enumeration attacks
    return false
  }

  // 2. Generate random 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString()

  // 3. Hash the OTP for storage
  const otpHash = await bcrypt.hash(otp, 10)

  // 4. Define the Redis key and store the hash with expiration
  const redisKey = `${RESET_KEY_PREFIX}${email}`

  await redisClient.setex(redisKey, OTP_EXPIRATION_SECONDS, otpHash)

  // 5. Send the PLAIN TEXT OTP to the user
  console.log(`Password reset OTP for ${email}: ${otp}`) // For debugging; remove in production
  await sendEmail(
    email,
    'Password Reset Code',
    `<div style="font-family: Arial, 'Helvetica Neue', Helvetica, sans-serif; box-sizing: border-box; background-color: #f8f9fa; width: 100%; padding: 30px; margin: 0;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); overflow: hidden;">
    
    <div style="background-color: #0d6efd; padding: 30px; text-align: center;">
      <h1 style="color: #ffffff; font-size: 28px; margin: 0; font-weight: 600;">Peerprep</h1>
      <p style="color: #e9ecef; font-size: 16px; margin: 5px 0 0;">Password Reset Request</p>
    </div>

    <div style="padding: 40px; line-height: 1.6; color: #343a40;">
      <p style="font-size: 18px; margin-bottom: 25px;">Hello,</p>
      <p style="font-size: 16px; margin-bottom: 25px;">We received a request to reset the password for your account. Please use the One-Time Password (OTP) below to proceed.</p>
      
      <div style="background-color: #e9ecef; border-radius: 8px; padding: 20px; text-align: center; margin-bottom: 25px;">
        <p style="font-size: 16px; margin: 0 0 10px; color: #495057;">Your code is:</p>
        <p style="font-size: 36px; font-weight: 700; color: #0d6efd; margin: 0; letter-spacing: 4px;">
          ${otp}
        </p>
      </div>

      <p style="font-size: 16px; margin-bottom: 25px;">This code will expire in <strong>10 minutes</strong>.</p>
      
      <hr style="border: 0; border-top: 1px solid #dee2e6; margin: 25px 0;">
      <p style="font-size: 14px; color: #6c757d; margin: 0;">If you did not request a password reset, please ignore this email or contact our support team immediately. Your account security is important to us.</p>
    </div>
  </div>
</div>`
  )

  return true
}

/**
 * Verifies the OTP from Redis and resets the password in PostgreSQL.
 */
export const resetPassword = async (
  email: string,
  code: string,
  newPassword: string
): Promise<boolean> => {
  // 1. Define the Redis key and get the stored hash
  const redisKey = `${RESET_KEY_PREFIX}${email}`
  const storedHash = await redisClient.get(redisKey)

  // 2. Check if token exists, is expired, or already used
  // If `redisClient.get` returns null, it means the key doesn't exist,
  // which covers "no code found", "expired", and "already used" (see step 5).
  if (!storedHash) {
    throw new AppError('Invalid or expired reset code', 400)
  }

  // 3. Validate the user-provided code against the stored hash
  const isValid = await bcrypt.compare(code, storedHash)
  if (!isValid) {
    // Throw the same error to prevent attackers from knowing
    // if the code was wrong vs. expired.
    throw new AppError('Invalid or expired reset code', 400)
  }

  // 4. Code is valid, hash the new password
  const hashedPassword = await bcrypt.hash(newPassword, 10)

  // 5. Check if the password meets complexity requirements, terminate if otherwise
  if (!isValidPassword(newPassword)) {
    throw new AppError('New password does not meet requirements', 400)
  }

  // 6. Update the user's password in the main database
  // We use 'RETURNING id' to confirm the update worked
  const updateResult = await pool.query(
    'UPDATE users SET password_hash = $1 WHERE email = $2 RETURNING id',
    [hashedPassword, email]
  )

  if (updateResult.rows.length === 0) {
    // This should not happen if the `requestPasswordReset` check passed,
    // but it's a good safeguard.
    throw new AppError('User not found', 404)
  }

  // 7. Delete the key from Redis to mark it as "used"
  await redisClient.del(redisKey)

  return true
}
