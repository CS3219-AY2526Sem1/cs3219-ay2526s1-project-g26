export interface Question {
  id: number
  title: string
  description: string
  difficulty: string
  categories?: string[]
  input?: string
  output?: string
  constraints?: string[]
  examples?: Array<{
    input: string
    output: string
  }>
  hints?: string[]
}
