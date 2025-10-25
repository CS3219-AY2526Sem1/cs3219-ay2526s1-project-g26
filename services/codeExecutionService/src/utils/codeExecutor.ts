import { exec, spawn } from 'child_process'
import { promisify } from 'util'
import { writeFile, unlink, mkdir } from 'fs/promises'
import path, { dirname } from 'path'
import { fileURLToPath } from 'url'
import pidusage from 'pidusage'
import { CodeExecutionOutput } from '../types/index.js'
import { getLogger } from './logger.js'

const execAsync = promisify(exec)
const logger = getLogger('CodeExecutor')

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Temporary directory for code execution
const TEMP_DIR = path.join(__dirname, '../../temp')

// Language-specific configurations
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
  code: string,
  language: 'cpp' | 'python' | 'javascript',
  input: string,
  timeLimit: number = 15000,
  memoryLimit: number = 256
): Promise<CodeExecutionOutput> => {
  const startTime = Date.now()
  const timestamp = Date.now()
  const randomId = Math.random().toString(36).substring(7)
  const baseFilename = `temp_${timestamp}_${randomId}`

  const config = LANGUAGE_CONFIG[language]
  const sourceFile = path.join(TEMP_DIR, `${baseFilename}${config.extension}`)
  const executableFile = path.join(TEMP_DIR, baseFilename)

  try {
    // Ensure temp directory exists
    await mkdir(TEMP_DIR, { recursive: true })

    // Write source code to temporary file
    await writeFile(sourceFile, code)
    logger.info(`Created source file: ${sourceFile}`)

    // Compilation step (only for C++)
    if (config.compileCmd) {
      try {
        const compileCmd = config.compileCmd(sourceFile, executableFile)
        logger.info(`Compiling: ${compileCmd}`)
        await execAsync(compileCmd, { timeout: timeLimit })
        logger.info('Compilation successful')
      } catch (compileError: unknown) {
        const error = compileError as { message?: string; stderr?: string }
        const errorMessage = error.message || String(compileError)
        logger.error('Compilation failed:', errorMessage)
        // Clean up source file
        await unlink(sourceFile).catch(() => {})
        return {
          success: false,
          output: '',
          error: `Compilation Error: ${error.stderr || errorMessage}`,
          executionTime: Date.now() - startTime,
        }
      }
    }

    // Execution step
    const executeCmd = config.compileCmd ? executableFile : sourceFile
    logger.info(`Executing: ${executeCmd}`)

    // Execute code with stdin input using spawn
    const result = await executeWithStdin(
      language,
      executeCmd,
      input,
      timeLimit,
      memoryLimit
    )

    const executionTime = Date.now() - startTime
    logger.info(`Execution completed in ${executionTime}ms`)

    // Clean up temporary files
    await cleanupFiles(sourceFile, executableFile, config.compileCmd !== null)

    return {
      success: true,
      output: result.stdout,
      error: result.stderr || undefined,
      executionTime,
      memoryUsed: result.memoryUsed,
    }
  } catch (error: unknown) {
    const executionTime = Date.now() - startTime

    // Clean up temporary files
    await cleanupFiles(sourceFile, executableFile, config.compileCmd !== null)

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
  language: 'cpp' | 'python' | 'javascript',
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

    // Spawn the process
    const child = spawn(command, args, {
      timeout: timeLimit,
    })

    let stdout = ''
    let stderr = ''
    let killed = false
    let memoryExceeded = false
    let maxMemory = 0

    // Sample memory immediately after process starts (for fast-executing programs like C++)
    const sampleMemory = async () => {
      try {
        if (child.pid) {
          const stats = await pidusage(child.pid)
          const currentMemory = stats.memory / (1024 * 1024)
          if (currentMemory > maxMemory) {
            maxMemory = currentMemory
          }
          return currentMemory
        }
      } catch (_error) {
        // Ignore errors
      }
      return 0
    }

    // Take initial memory sample after a short delay to ensure process has started
    setTimeout(() => {
      sampleMemory()
    }, 5)

    // Monitor memory usage of the child process
    const memoryMonitor = setInterval(async () => {
      try {
        if (child.pid) {
          const currentMemory = await sampleMemory()

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
    }, 10) // Check every 10ms

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
    child.on('close', async (code) => {
      clearTimeout(timer)
      clearInterval(memoryMonitor)

      // Take a final memory sample before process is completely gone
      // This helps capture memory usage for very fast programs
      await sampleMemory()

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

/**
 * Clean up temporary files after execution
 */
const cleanupFiles = async (
  sourceFile: string,
  executableFile: string,
  hasExecutable: boolean
): Promise<void> => {
  try {
    await unlink(sourceFile)
    if (hasExecutable) {
      await unlink(executableFile).catch(() => {}) // Executable might not exist if compilation failed
    }
    logger.info('Temporary files cleaned up')
  } catch (error) {
    logger.error('Failed to clean up temporary files:', error)
  }
}
