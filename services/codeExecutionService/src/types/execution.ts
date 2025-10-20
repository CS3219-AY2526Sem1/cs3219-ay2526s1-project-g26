export interface TestCase {
  input: string;
  output: string;
  is_hidden: boolean;
}

export enum SubmissionResultType {
  COMPILE_ERROR = 'COMPILE_ERROR',
  RUNTIME_ERROR = 'RUNTIME_ERROR',
  TIME_EXCEEDED = 'TIME_EXCEEDED',
  MEMORY_EXCEEDED = 'MEMORY_EXCEEDED',
  WRONG_ANSWER = 'WRONG_ANSWER',
  PASSED = 'PASSED'
}

export interface SubmissionResult {
  type: SubmissionResultType;
  timeTaken?: number; // in milliseconds
  memoryUsage?: number; // in MB
  additionalInfo?: string;
  testCaseResults?: TestCaseResult[];
}

export interface TestCaseResult {
  testCaseIndex: number;
  passed: boolean;
  actualOutput?: string;
  expectedOutput: string;
  timeTaken?: number;
  memoryUsage?: number;
  error?: string;
}

export interface CodeExecutionRequest {
  questionId: string;
  language: SupportedLanguage;
  codeText: string;
  isFullSubmission?: boolean; // true for Submit, false for Run (only public test cases)
}

export enum SupportedLanguage {
  PYTHON = 'python',
  JAVASCRIPT = 'javascript',
  JAVA = 'java',
  CPP = 'cpp'
}

export interface ExecutionConfig {
  timeLimit: number; // in milliseconds
  memoryLimit: number; // in MB
}

export interface CompilationResult {
  success: boolean;
  executable?: string;
  error?: string;
}