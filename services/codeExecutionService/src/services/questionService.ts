import { RunMode, TestCase } from '../types/index.js'
import { QUESTION_SERVICE_URL } from '../config/index.js'

export const getTestCases = async (
  questionId: string,
  mode: RunMode
): Promise<TestCase[]> => {
  const res = await fetch(
    `${QUESTION_SERVICE_URL}/${questionId}/test-cases?type=${mode === 'run' ? 'public' : 'all'}`
  )
  const result = (await res.json()) as {
    success: boolean
    testCases: TestCase[]
  }

  return result.testCases
}
