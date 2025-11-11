export type ExecutionStatus =
  | 'In Progress'
  | 'Accepted'
  | 'Wrong Answer'
  | 'Time Limit Exceeded'
  | 'Memory Limit Exceeded'
  | 'Runtime Error'
  | 'Compilation Error'

export type Language = 'cpp' | 'javascript' | 'python'

export type RunMode = 'run' | 'submit'

// Raw output from code execution (used internally by codeExecutor utility)
export interface CodeExecutionOutput {
  success: boolean
  output: string
  error?: string
  executionTime: number // Execution time in ms
  memoryUsed?: number // Memory used in MB
}

export interface TestCaseDetails {
  input: string
  expected_output: string
  actual_output: string
}

export interface SubmissionResult {
  status: ExecutionStatus
  passed_tests: number
  total_tests: number
  execution_time?: number
  memory_used?: number
  output?: string
  error?: string
  test_case_details?: TestCaseDetails
}

export interface ExecuteCodeRequest {
  question_id: string
  language: string
  code_text: string
  mode: 'run' | 'submit'
  room_id: string
  user_ids: string[]
}

export interface TestCase {
  input: string
  output: string
}

export interface Question {
  title: string
  difficulty: string
  categories: string[]
  test_cases: TestCase[]
}
