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
  constraints?: string[]
  examples?: object[]
  hints?: string[]
  categories: string[]
  test_cases: TestCase[]
  is_active: boolean
}

export interface CreateQuestionInput {
  title: string
  description: string
  difficulty: string
  constraints?: string[]
  examples: object[]
  hints?: string[]
  categories: string[]
  test_cases: TestCase[]
  is_active?: boolean
}

export type MatchedQuestion = Omit<Question, 'testCases' | 'is_active'>
