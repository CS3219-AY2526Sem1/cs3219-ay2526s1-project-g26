import dotenv from 'dotenv'
dotenv.config()

export const JWT_SECRET = process.env.JWT_SECRET || 'secret'
export const PORT = process.env.PORT || 3000
export const DATABASE_URL =
  process.env.DATABASE_URL || "redis://localhost:6379"
