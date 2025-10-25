interface TestCase {
  input: string
  output: string
  is_hidden: boolean
}

export interface Question {
  _id: string
  description: string
  difficulty: string
  input?: string
  output?: string
  constraints?: string[]
  examples?: Array<{
    input: string
    output: string
  }>
  hints?: string[]
  categories: string[]
  test_cases: TestCase[]
  is_active: boolean
}
