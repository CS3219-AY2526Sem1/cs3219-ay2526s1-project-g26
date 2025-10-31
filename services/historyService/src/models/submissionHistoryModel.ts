import { type ObjectId } from 'mongodb'

export type ResultLabel =
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

export interface UserSubmission {
  user_id: string
  submission_id: string | ObjectId
}

export interface SubmissionSummary {
  question_title: string
  submission_time: string
  difficulty: string
  language: Language
  overall_status: string
}

export interface SubmissionHistoryResponse {
  submissions: SubmissionSummary[]
  total: number
}

// Todo: Check if this needs to be altered to match with frontend better
export interface SubmissionDetailsResponse {
  title: string
  submission_time: string
  language: Language
  code: string

  status: string
  difficulty: string
  categories: string[]
  memory: string
  runtime: string

  error_message?: string
}

export interface CreateSubmissionBody {
  result: Submission
  user_ids: string[]
}
