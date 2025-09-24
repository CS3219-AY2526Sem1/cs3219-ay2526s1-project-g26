export const JWT_SECRET = process.env.JWT_SECRET || 'secret'
export const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '14d'
export const PORT = process.env.PORT || 4000
export const DATABASE_URL =
  process.env.DATABASE_URL || 'postgres://user:password@localhost:5432/dbname'
