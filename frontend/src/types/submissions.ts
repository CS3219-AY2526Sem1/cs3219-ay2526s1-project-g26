export type ResultLabel =
  | 'Accepted'
  | 'Wrong Answer'
  | 'Time Limit Exceeded'
  | 'Memory Limit Exceeded'
  | 'Runtime Error'
  | 'Compilation Error'

export type Language = 'cpp' | 'javascript' | 'python'
export type RunMode = 'run' | 'submit'

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

export interface SubmissionDetail {
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
