import { randomUUID, type UUID } from 'crypto'
import { executeCode } from '../utils/codeExecutor.js'
import { TIME_LIMIT } from '../config/index.js'
import {
  ExecutionStatus,
  SubmissionResult,
  CodeExecutionOutput,
  Language,
  TestCase,
} from '../types/index.js'
import { getLogger } from '../utils/logger.js'
import os from 'os'

import { exec } from 'child_process'
import { promisify } from 'util'
import { writeFile, unlink, mkdir } from 'fs/promises'
import path from 'path'

const execAsync = promisify(exec)

// Temporary directory for code execution
const TEMP_DIR = os.tmpdir()

const logger = getLogger('codeExecutionService')

const LANGUAGE_CONFIG = {
  cpp: {
    extension: '.cpp',
    compileCmd: (filename: string, outputFile: string) =>
      `g++ ${filename} -o ${outputFile}`,
    executeCmd: (executablePath: string) => executablePath,
  },
  python: {
    extension: '.py',
    compileCmd: null,
    executeCmd: (filename: string) => `python ${filename}`,
  },
  javascript: {
    extension: '.cjs', // Use .cjs to support CommonJS (require)
    compileCmd: null,
    executeCmd: (filename: string) => `node ${filename}`,
  },
}

/**
 * Normalize output string for comparison
 * Handles multi-line outputs by:
 * - Normalizing line endings (convert \r\n to \n)
 * - Trimming trailing whitespace from each line
 * - Removing empty lines
 *
 * @param output - The output string to normalize
 * @returns Array of normalized lines
 */
const normalizeOutput = (output: string): string[] => {
  return output
    .replace(/\r\n/g, '\n')
    .split('\n')
    .map((line) => line.trimEnd())
    .filter((line) => line.length > 0)
}

/**
 * Compare two outputs for equality
 * Tries exact match first, then sorted match (for order-independent outputs)
 *
 * @param actual - Actual output from code execution
 * @param expected - Expected output from test case
 * @returns true if outputs match
 */
const compareOutputs = (actual: string, expected: string): boolean => {
  const actualLines = normalizeOutput(actual)
  const expectedLines = normalizeOutput(expected)

  if (actualLines.length !== expectedLines.length) {
    return false
  }

  const exactMatch = actualLines.every((line, i) => line === expectedLines[i])
  if (exactMatch) {
    return true
  }

  const actualSorted = [...actualLines].sort()
  const expectedSorted = [...expectedLines].sort()
  return actualSorted.every((line, i) => line === expectedSorted[i])
}

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
  testCases: TestCase[],
  language: Language,
  code_text: string
): Promise<SubmissionResult> => {
  // Step 1: Prepare execution file
  const id: UUID = randomUUID()
  const baseFilename = `temp_${id}`

  const config = LANGUAGE_CONFIG[language]
  const sourceFile = path.join(TEMP_DIR, `${baseFilename}${config.extension}`)
  const executableFile = path.join(TEMP_DIR, baseFilename)

  // Ensure temp directory exists
  await mkdir(TEMP_DIR, { recursive: true })

  // Write source code to temporary file
  await writeFile(sourceFile, code_text)
  logger.info(`Created source file: ${sourceFile}`)

  // Compilation step (only for C++)
  if (config.compileCmd) {
    try {
      const compileCmd = config.compileCmd(sourceFile, executableFile)
      logger.info(`Compiling: ${compileCmd}`)
      await execAsync(compileCmd, { timeout: 2000 })
      logger.info('Compilation successful')
    } catch (compileError: unknown) {
      const error = compileError as { message?: string; stderr?: string }
      const errorMessage = error.message || String(compileError)
      logger.error('Compilation failed:', errorMessage)
      unlink(sourceFile).catch(() => {})
      // Clean up source file
      return {
        status: 'Compilation Error',
        output: '',
        error: `Compilation Error: ${error.stderr || errorMessage}`,
        execution_time: 0,
        memory_used: 0,
        total_tests: testCases.length,
        passed_tests: 0,
        test_case_details:
          testCases.length > 0
            ? {
                input: testCases[0].input,
                expected_output: testCases[0].output,
                actual_output: '',
              }
            : undefined,
      }
    }
  }

  // Step 2: Execute code against each test case
  let passedTests = 0
  let totalExecutionTime = 0
  let maxMemoryUsed = 0
  let lastTestCaseInput = ''
  let lastExpectedOutput = ''
  let lastActualOutput = ''

  for (let i = 0; i < testCases.length; i++) {
    const testCase = testCases[i]

    try {
      // Execute code with test case input
      const result: CodeExecutionOutput = await executeCode(
        language === 'cpp' ? executableFile : sourceFile,
        language,
        testCase.input,
        TIME_LIMIT
      )

      totalExecutionTime += result.executionTime
      if (result.memoryUsed && result.memoryUsed > maxMemoryUsed) {
        maxMemoryUsed = result.memoryUsed
      }

      // Track last test case details
      lastTestCaseInput = testCase.input
      lastExpectedOutput = testCase.output
      lastActualOutput = result.output

      // Step 3: Check if execution failed
      if (!result.success) {
        const status = determineErrorStatus(result.error)
        logger.error(
          `Test case ${i + 1} failed with status: ${status}, error: ${result.error}`
        )

        return {
          status,
          passed_tests: passedTests,
          total_tests: testCases.length,
          execution_time: totalExecutionTime,
          memory_used: maxMemoryUsed > 0 ? maxMemoryUsed : undefined,
          error: result.error,
          output: result.output || undefined,
          test_case_details: {
            input: testCase.input,
            expected_output: testCase.output,
            actual_output: result.output || '',
          },
        }
      }

      // Step 4: Compare actual output with expected output
      const actualOutput = result.output
      const expectedOutput = testCase.output

      if (compareOutputs(actualOutput, expectedOutput)) {
        passedTests++
      } else {
        logger.info(
          `Test case ${i + 1} failed - Wrong Answer. Expected: "${expectedOutput.trim()}", Got: "${actualOutput.trim()}"`
        )

        return {
          status: 'Wrong Answer',
          passed_tests: passedTests,
          total_tests: testCases.length,
          execution_time: totalExecutionTime,
          memory_used: maxMemoryUsed > 0 ? maxMemoryUsed : undefined,
          output: actualOutput,
          test_case_details: {
            input: testCase.input,
            expected_output: expectedOutput,
            actual_output: actualOutput,
          },
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
        total_tests: testCases.length,
        execution_time: totalExecutionTime,
        memory_used: maxMemoryUsed > 0 ? maxMemoryUsed : undefined,
        error: error instanceof Error ? error.message : 'Unknown error',
        test_case_details: {
          input: testCase.input,
          expected_output: testCase.output,
          actual_output: '',
        },
      }
    }
  }

  // Step 5: All test cases passed!
  logger.info(
    `All ${testCases.length} test cases passed! Total execution time: ${totalExecutionTime}ms, Max memory: ${maxMemoryUsed}MB`
  )

  unlink(sourceFile)
  if (language === 'cpp') {
    unlink(executableFile).catch(() => {}) // Executable might not exist if compilation failed
  }

  return {
    status: 'Accepted',
    passed_tests: passedTests,
    total_tests: testCases.length,
    execution_time: totalExecutionTime,
    memory_used: maxMemoryUsed > 0 ? maxMemoryUsed : undefined,
    test_case_details: {
      input: lastTestCaseInput,
      expected_output: lastExpectedOutput,
      actual_output: lastActualOutput,
    },
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
