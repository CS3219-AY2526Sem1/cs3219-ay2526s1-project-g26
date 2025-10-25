import { ObjectId } from 'mongodb'

export interface TestCase {
  input: string
  output: string
  is_hidden: boolean
}

export interface Question {
  _id: ObjectId
  title: string
  input?: string
  output?: string
  description: string
  difficulty: string
  categories: string[]
  examples?: TestCase[]
  constraints?: string[]
  hints?: string[]
  test_cases: TestCase[]
  is_active: boolean
}
