import { type ObjectId } from 'mongodb'

export type ResultLabel =
  | 'In Progress'
  | 'Accepted'
  | 'Wrong Answer'
  | 'Time Limit Exceeded'
  | 'Memory Limit Exceeded'
  | 'Runtime Error'
  | 'Compilation Error'

export type Language = 'cpp' | 'javascript' | 'python'
export type RunMode = 'run' | 'submit'

export interface ResultInformation {
  result: ResultLabel
  max_memory_used?: number // in MB
  time_taken: number // in ms
  error?: string
  output: string | undefined
  passed_tests: number
  total_tests: number
}

export interface Submission {
  // _id: string | ObjectId // ObjectId includes timestamp info already
  question_title: string
  categories: string[]

  code: string
  difficulty: string
  language: Language
  overall_result: ResultInformation
  test_case_results?: ResultInformation[]
}

export interface SubmissionSummary {
  submission_id: string
  title: string
  submission_time: string
  overall_status: string
  difficulty: string
  language: Language
}

export interface UserSubmission {
  user_id: string
  submission_id: string | ObjectId
}

// Rename?
export interface SubmissionHistoryResponse {
  submissions: SubmissionSummary[]
  total: number
}

export interface SingleSubmissionHistoryResponse {
  submission: Submission
}

export interface CreateSubmissionBody {
  result: {
    question_id: string
    question_title: string
    categories: string[]
    difficulty: string
    code: string
    language: Language
    mode: RunMode
    ticket_id: string
    overall_result: ResultInformation
  }
  user_ids: string[]
}
