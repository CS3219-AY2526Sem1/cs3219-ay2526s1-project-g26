export interface SubmissionDataSummary {
  submission_id: string
  title: string
  submission_time: string
  overall_status: string
  difficulty: string
  language: string
}

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
