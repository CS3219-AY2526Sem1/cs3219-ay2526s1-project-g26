import { type ObjectId } from 'mongodb'

export type ResultLabel = 'In Progress' | 'Accepted'
| 'Wrong Answer' | 'Time Limit Exceeded'
| 'Memory Limit Exceeded' | 'Runtime Error'
| 'Compilation Error'

export interface ResultInformation {
  result: ResultLabel
  max_memory_used: number // in MB
  time_taken: number // in ms
  additional_info?: string
}

export interface Submission {
  _id: string | ObjectId // ObjectId includes timestamp info already
  question_title: string
  categories: string[]

  code: string
  difficulty: string
  language: string
  overall_result: ResultInformation
  test_case_results: ResultInformation[]
}

export interface SubmissionSummary {
  submission_id: string
  title: string
  submission_time: string
  overall_status: string
  difficulty: string
  language: string
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

