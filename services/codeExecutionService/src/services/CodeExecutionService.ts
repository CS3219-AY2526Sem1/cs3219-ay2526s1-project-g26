import { getTestCases } from './questionService.js'
import { executeCode } from '../utils/codeExecutor.js'
import { TIME_LIMIT } from '../config/index.js'
import {
  ExecutionStatus,
  SubmissionResult,
  CodeExecutionOutput,
} from '../types/index.js'
import { getLogger } from '../utils/logger.js'

const logger = getLogger('codeExecutionService')

/**
 * Validate user code against test cases
 * This is the CORE BUSINESS LOGIC that orchestrates the entire code execution flow
 *
 * @param question_id - ID of the question to test against
 * @param language - Programming language (cpp/python/javascript)
 * @param code_text - User's source code
 * @param mode - 'run' (examples only) or 'submit' (all test cases)
 * @returns SubmissionResult with statistics and status
 */
export const validateCode = async (
  question_id: string,
  language: 'cpp' | 'python' | 'javascript',
  code_text: string,
  mode: 'run' | 'submit'
): Promise<SubmissionResult> => {
  logger.info(
    `Starting validation for question ${question_id}, mode: ${mode}, language: ${language}`
  )

  // Step 1: Get test cases from database
  const testCases = await getTestCases(question_id, mode)
  const totalTests = testCases.length

  if (totalTests === 0) {
    // This should never happen - every question must have test cases
    logger.error(`No test cases found for question ${question_id}`)
    throw new Error(`Question ${question_id} has no test cases`)
  }

  logger.info(`Loaded ${totalTests} test cases`)

  // Step 2: Execute code against each test case
  let passedTests = 0
  let totalExecutionTime = 0

  for (let i = 0; i < testCases.length; i++) {
    const testCase = testCases[i]
    logger.info(`Running test case ${i + 1}/${totalTests}`)

    try {
      // Execute code with test case input
      const result: CodeExecutionOutput = await executeCode(
        code_text,
        language,
        testCase.input,
        TIME_LIMIT
      )

      totalExecutionTime += result.executionTime

      // Step 3: Check if execution failed
      if (!result.success) {
        const status = determineErrorStatus(result.error)
        logger.error(
          `Test case ${i + 1} failed with status: ${status}, error: ${result.error}`
        )

        return {
          status,
          passed_tests: passedTests,
          total_tests: totalTests,
          execution_time: totalExecutionTime,
          error: result.error,
          output: result.output || undefined,
        }
      }

      // Step 4: Compare actual output with expected output
      const actualOutput = result.output.trim()
      const expectedOutput = testCase.output.trim()

      if (actualOutput === expectedOutput) {
        passedTests++
        logger.info(`Test case ${i + 1} passed`)
      } else {
        logger.info(
          `Test case ${i + 1} failed - Wrong Answer. Expected: "${expectedOutput}", Got: "${actualOutput}"`
        )

        return {
          status: 'Wrong Answer',
          passed_tests: passedTests,
          total_tests: totalTests,
          execution_time: totalExecutionTime,
          output: actualOutput,
        }
      }
    } catch (error) {
      // Unexpected error during execution
      logger.error(
        `Unexpected error on test case ${i + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`
      )

      return {
        status: 'Runtime Error',
        passed_tests: passedTests,
        total_tests: totalTests,
        execution_time: totalExecutionTime,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  // Step 5: All test cases passed!
  logger.info(
    `All ${totalTests} test cases passed! Total execution time: ${totalExecutionTime}ms`
  )

  return {
    status: 'Accepted',
    passed_tests: passedTests,
    total_tests: totalTests,
    execution_time: totalExecutionTime,
  }
}

/**
 * Determine execution status from error message
 * Priority: Compilation Error > Time Limit Exceeded > Runtime Error
 */
const determineErrorStatus = (error?: string): ExecutionStatus => {
  if (!error) {
    return 'Runtime Error'
  }

  const errorLower = error.toLowerCase()

  // Check for compilation errors
  if (
    errorLower.includes('compilation error') ||
    errorLower.includes('syntaxerror') ||
    errorLower.includes('expected')
  ) {
    return 'Compilation Error'
  }

  // Check for timeout
  if (
    errorLower.includes('time limit exceeded') ||
    errorLower.includes('timeout')
  ) {
    return 'Time Limit Exceeded'
  }

  // Default to runtime error
  return 'Runtime Error'
}
