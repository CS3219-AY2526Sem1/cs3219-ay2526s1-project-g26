export interface Question {
  id: number
  title: string
  description: string
  difficulty: string
  constraints?: string
  examples?: object[]
  hints?: string[]
}
