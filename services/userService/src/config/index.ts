import dotenv from 'dotenv'
dotenv.config()
export const JWT_SECRET = process.env.JWT_SECRET || 'secret'
export const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '14d'
export const PORT = process.env.PORT || 4000
export const DB_PORT = parseInt(process.env.DB_PORT || '5432')
export const DB_HOST = process.env.DB_HOST || 'localhost'
export const DB_USER = process.env.DB_USER || 'postgres'
export const DB_NAME = process.env.DB_NAME || 'user_db'
export const DB_PASSWORD = process.env.DB_PASSWORD || 'postgres'
