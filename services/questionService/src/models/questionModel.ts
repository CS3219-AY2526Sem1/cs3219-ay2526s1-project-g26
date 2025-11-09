import { type ObjectId } from 'mongodb'

export interface TestCase {
  input: string
  output: string
  is_hidden: boolean
}

export interface Question {
  _id: string | ObjectId
  title: string
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

export interface CreateQuestionInput {
  title: string
  description: string
  difficulty: string
  constraints?: string
  examples: string
  hints?: string
  categories: string
  test_cases?: string
  is_active?: boolean
}

export type MatchedQuestion = Omit<Question, 'testCases' | 'is_active'>

export interface QuestionPartial {
  _id: string
  categories: string[]
  difficulty: string
}
