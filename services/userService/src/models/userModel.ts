export type UserRole = 'user' | 'admin'

export interface User {
  id: string // UUID V4
  email: string
  password_hash: string
  full_name: string
  role: UserRole
  created_at: Date
  updated_at: Date
}
