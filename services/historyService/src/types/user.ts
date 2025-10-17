export type UserRole = 'user' | 'admin'

export interface User {
  id: string
  role: UserRole[]
  full_name: string
  email: string
  iat: number
  exp: number
}
