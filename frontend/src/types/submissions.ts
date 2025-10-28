export interface SubmissionDataSummary {
  submission_id: string
  title: string
  submission_time: string
  overall_status: string
  difficulty: string
  language: string
}

export interface SubmissionDataResponse {
  submissions: SubmissionDataSummary[]
  total: number
}

// old schema
export interface SubmissionDetail {
  submission_id: string
  title: string
  difficulty: 'Easy' | 'Medium' | 'Hard'
  language: string
  submission_time: string
  overall_status: string
  status: 'Passed' | 'Failed'
  runtime?: string
  memory?: string
  algorithms: string[]
  error_message?: string
  code: string
}

// new schema
export interface ResultInformation {
  result: string
  max_memory_used?: number // in MB
  time_taken: number // in ms
  error?: string
  output: string | undefined
  passed_tests: number
  total_tests: number
}

// new schema
export interface SubmissionDetail2 {
  question_id: string
  question_title: string
  categories: string[]
  difficulty: string
  code: string
  language: string
  mode: string
  ticket_id: string
  overall_result: ResultInformation
}
