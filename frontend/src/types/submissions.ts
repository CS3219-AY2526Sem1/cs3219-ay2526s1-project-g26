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

export interface SubmissionDetailResponse {
  title: string
  submission_time: string
  language: string
  code: string

  status: 'Passed' | 'Failed'
  difficulty: 'Easy' | 'Medium' | 'Hard'
  categories: string[]
  memory: string
  runtime: string

  error_message?: string
}
