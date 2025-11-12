/**
 * AI Assistance Disclosure:
 * Tool: Github Copilot(Claude Sonnet 4.5), date: 2025-10-24
 * Scope: Generated `executeCode` function including language configuration for C++/Python/JavaScript, basic process spawning with child_process, and timeout handling structure.
 * Author review: I validated correctness, added memory monitoring with `pidusage` and edited for style.
 */
import { spawn } from 'child_process'
import pidusage from 'pidusage'
import { CodeExecutionOutput, Language } from '../types/index.js'
import { getLogger } from './logger.js'

const logger = getLogger('CodeExecutor')

/**
 * Execute user code with given input
 * This is a LOW-LEVEL utility that only runs code and captures output
 * It does NOT compare output with expected results - that's done at the service layer
 *
 * @param code - User's source code
 * @param language - Programming language (cpp/python/javascript)
 * @param input - Input string to pass to the program via stdin
 * @param timeLimit - Maximum execution time in milliseconds (default: 15000ms = 15s)
 * @param memoryLimit - Maximum memory usage in MB (default: 256MB)
 * @returns CodeExecutionOutput with success status, output, error, and execution time
 */
export const executeCode = async (
  executableFilePath: string,
  language: Language,
  input: string,
  timeLimit: number = 2000,
  memoryLimit: number = 256
): Promise<CodeExecutionOutput> => {
  const startTime = Date.now()

  try {
    // Execute code with stdin input using spawn
    const result = await executeWithStdin(
      language,
      executableFilePath,
      input,
      timeLimit,
      memoryLimit
    )

    const executionTime = Date.now() - startTime

    return {
      success: true,
      output: result.stdout,
      error: result.stderr || undefined,
      executionTime,
      memoryUsed: result.memoryUsed,
    }
  } catch (error: unknown) {
    const executionTime = Date.now() - startTime
    const execError = error as {
      killed?: boolean
      signal?: string
      stdout?: string
      stderr?: string
      message?: string
    }

    // Handle timeout
    if (execError.killed && execError.signal === 'SIGTERM') {
      logger.error('Time Limit Exceeded')
      return {
        success: false,
        output: '',
        error: 'Time Limit Exceeded',
        executionTime: timeLimit,
      }
    }

    // Handle runtime error
    const errorMessage = execError.message || String(error)
    logger.error('Runtime error:', errorMessage)
    return {
      success: false,
      output: execError.stdout || '',
      error: `Runtime Error: ${execError.stderr || errorMessage}`,
      executionTime,
    }
  }
}

/**
 * Execute command with stdin support using spawn
 */
const executeWithStdin = (
  language: Language,
  filePath: string,
  input: string,
  timeLimit: number,
  memoryLimit: number
): Promise<{ stdout: string; stderr: string; memoryUsed?: number }> => {
  return new Promise((resolve, reject) => {
    // Determine command and args based on language
    let command: string
    let args: string[]

    if (language === 'cpp') {
      command = filePath // Compiled executable
      args = []
    } else if (language === 'python') {
      command = 'python'
      args = [filePath]
    } else if (language === 'javascript') {
      command = 'node'
      args = [filePath]
    } else {
      reject(new Error(`Unsupported language: ${language}`))
      return
    }

    let stdout = ''
    let stderr = ''
    let killed = false
    let memoryExceeded = false
    let maxMemory = 0

    // Spawn the process
    const child = spawn(command, args, {
      timeout: timeLimit,
    })

    if (child.pid) {
      pidusage(child.pid)
        .then((stats) => {
          // stats.memory is in bytes, convert to MB
          const currentMemory = stats.memory / (1024 * 1024)
          if (currentMemory > maxMemory) {
            maxMemory = currentMemory
          }

          // Check if memory limit exceeded
          if (currentMemory > memoryLimit) {
            memoryExceeded = true
            child.kill('SIGTERM')
          }
        })
        .catch((_err) => {})
    }

    let memoryMonitor: NodeJS.Timeout
    // Monitor memory usage of the child process
    if (!memoryExceeded) {
      memoryMonitor = setInterval(async () => {
        try {
          if (child.pid) {
            const stats = await pidusage(child.pid)
            // stats.memory is in bytes, convert to MB
            const currentMemory = stats.memory / (1024 * 1024)
            if (currentMemory > maxMemory) {
              maxMemory = currentMemory
            }

            // Check if memory limit exceeded
            if (currentMemory > memoryLimit) {
              memoryExceeded = true
              clearInterval(memoryMonitor)
              clearTimeout(timer)
              child.kill('SIGTERM')
            }
          }
        } catch (_error) {
          // Ignore memory monitoring errors (process might have ended)
        }
      }, 25) // Check every 25ms
    }

    // Set up timeout
    const timer = setTimeout(() => {
      killed = true
      clearInterval(memoryMonitor)
      child.kill('SIGTERM')
    }, timeLimit)

    // Collect stdout
    child.stdout.on('data', (data) => {
      stdout += data.toString()
    })

    // Collect stderr
    child.stderr.on('data', (data) => {
      stderr += data.toString()
    })

    // Write input to stdin
    if (input) {
      child.stdin.write(input)
    }
    child.stdin.end()

    // Handle process completion
    child.on('close', (code) => {
      clearTimeout(timer)
      clearInterval(memoryMonitor)

      if (memoryExceeded) {
        reject({
          killed: true,
          signal: 'SIGTERM',
          stdout,
          stderr: 'Memory Limit Exceeded',
        })
      } else if (killed) {
        reject({
          killed: true,
          signal: 'SIGTERM',
          stdout,
          stderr: 'Time Limit Exceeded',
        })
      } else if (code !== 0) {
        reject({
          stdout,
          stderr: stderr || `Process exited with code ${code}`,
          message: `Process exited with code ${code}`,
        })
      } else {
        resolve({
          stdout,
          stderr,
          memoryUsed: Math.round(maxMemory * 100) / 100,
        })
      }
    })

    // Handle errors
    child.on('error', (err) => {
      clearTimeout(timer)
      clearInterval(memoryMonitor)
      reject({
        message: err.message,
        stderr: err.message,
        stdout: '',
      })
    })
  })
}
