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
        total_tests: 0,
        passed_tests: 0,
      }
    }
  }

  // Step 2: Execute code against each test case
  let passedTests = 0
  let totalExecutionTime = 0
  let maxMemoryUsed = 0

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
        }
      }

      // Step 4: Compare actual output with expected output
      const actualOutput = result.output.trim()
      const expectedOutput = testCase.output.trim()

      if (actualOutput === expectedOutput) {
        passedTests++
      } else {
        logger.info(
          `Test case ${i + 1} failed - Wrong Answer. Expected: "${expectedOutput}", Got: "${actualOutput}"`
        )

        return {
          status: 'Wrong Answer',
          passed_tests: passedTests,
          total_tests: testCases.length,
          execution_time: totalExecutionTime,
          memory_used: maxMemoryUsed > 0 ? maxMemoryUsed : undefined,
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
        total_tests: testCases.length,
        execution_time: totalExecutionTime,
        memory_used: maxMemoryUsed > 0 ? maxMemoryUsed : undefined,
        error: error instanceof Error ? error.message : 'Unknown error',
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
