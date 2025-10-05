export interface Question {
  id: number
  title: string
  description: string
  difficulty: string
  constraints?: string
  examples?: object[]
  hints?: string[]
}

export interface CreateQuestionInput {
  title: string
  description: string
  difficulty: string
  constraints?: string[]
  examples: object[]
  hints?: string[]
  categories: string[]
  input: string
  output: string
  is_active?: boolean
}
