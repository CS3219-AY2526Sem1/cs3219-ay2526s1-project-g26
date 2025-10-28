import { useState, useCallback } from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '../store'
import codeExecutionService from '../services/codeExecutionService'
import { ExecuteCodeResponse } from '../types/codeExecution'
import * as Y from 'yjs'

interface UseCodeExecutionOptions {
  ydoc: Y.Doc | null
  questionId: string
}

interface UseCodeExecutionReturn {
  loading: boolean
  result: ExecuteCodeResponse | null
  error: string | null
  executeRun: () => Promise<void>
  executeSubmit: () => Promise<void>
  clearResult: () => void
}

/**
 * Custom hook for code execution logic
 * Aggregates parameters from ydoc, Redux, and props
 */
export const useCodeExecution = ({
  ydoc,
  questionId,
}: UseCodeExecutionOptions): UseCodeExecutionReturn => {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<ExecuteCodeResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Get selected language from Redux
  const selectedLanguage = useSelector(
    (state: RootState) => state.collaboration.selectedLanguage
  )

  // Get code from ydoc
  const getCode = useCallback((): string => {
    if (!ydoc) {
      throw new Error('Editor not initialized')
    }
    const code = ydoc.getText().toString()
    if (!code.trim()) {
      throw new Error('Code cannot be empty')
    }
    return code
  }, [ydoc])

  // Execute code in "run" mode
  const executeRun = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const code = getCode()

      const response = await codeExecutionService.executeCode({
        question_id: questionId,
        language: selectedLanguage,
        code_text: code,
        mode: 'run',
      })

      setResult(response)

      // Output result to console
      console.log('\n=== Execution Result (Run) ===')
      console.log('status         :', response.status)
      console.log('passed_tests   :', response.passed_tests)
      console.log('total_tests    :', response.total_tests)
      console.log('execution_time :', response.execution_time, 'ms')
      console.log('memory_used    :', response.memory_used, 'MB')
      if (response.output) {
        console.log('output         :', response.output)
      }
      if (response.error) {
        console.log('error          :', response.error)
      }
      console.log('================================\n')
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Execution failed'
      setError(errorMessage)
      console.error('Run execution failed:', err)
    } finally {
      setLoading(false)
    }
  }, [questionId, selectedLanguage, getCode])

  // Execute code in "submit" mode
  const executeSubmit = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const code = getCode()

      const response = await codeExecutionService.executeCode({
        question_id: questionId,
        language: selectedLanguage,
        code_text: code,
        mode: 'submit',
      })

      setResult(response)

      // Output result to console
      console.log('\n=== Execution Result (Submit) ===')
      console.log('status         :', response.status)
      console.log('passed_tests   :', response.passed_tests)
      console.log('total_tests    :', response.total_tests)
      console.log('execution_time :', response.execution_time, 'ms')
      console.log('memory_used    :', response.memory_used, 'MB')
      if (response.output) {
        console.log('output         :', response.output)
      }
      if (response.error) {
        console.log('error          :', response.error)
      }
      console.log('==================================\n')
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Submission failed'
      setError(errorMessage)
      console.error('Submit execution failed:', err)
    } finally {
      setLoading(false)
    }
  }, [questionId, selectedLanguage, getCode])

  // Clear result
  const clearResult = useCallback(() => {
    setResult(null)
    setError(null)
  }, [])

  return {
    loading,
    result,
    error,
    executeRun,
    executeSubmit,
    clearResult,
  }
}

export default useCodeExecution
