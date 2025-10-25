// Must match backend types
export type ExecutionStatus =
  | 'In Progress'
  | 'Accepted'
  | 'Wrong Answer'
  | 'Time Limit Exceeded'
  | 'Memory Limit Exceeded'
  | 'Runtime Error'
  | 'Compilation Error'

export interface ExecuteCodeRequest {
  question_id: string
  language: string
  code_text: string
  mode: 'run' | 'submit'
}

export interface ExecuteCodeResponse {
  status: ExecutionStatus
  passed_tests: number
  total_tests: number
  execution_time?: number
  memory_used?: number
  output?: string
  error?: string
}
