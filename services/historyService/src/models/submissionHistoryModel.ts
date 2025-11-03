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

export interface TestCaseDetails {
  input: string
  expected_output: string
  actual_output: string
}

export interface ResultInformation {
  result: ResultLabel
  max_memory_used?: number // in MB
  time_taken: number // in ms
  error?: string
  output: string | undefined
  passed_tests: number
  total_tests: number
  test_case_details?: TestCaseDetails
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

// Todo: Alter this to fit with frontend new schema
export interface SubmissionDetailsResponse {
  question_id: string
  mode: RunMode
  question_title: string
  submission_time: string
  language: Language
  code: string
  difficulty: string
  categories: string[]
  overall_result: ResultInformation
}

export interface CreateSubmissionBody {
  result: Submission
  user_ids: string[]
}
