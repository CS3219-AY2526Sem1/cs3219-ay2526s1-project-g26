import { Question, RunMode, CreateSubmissionResult } from '../types/index.js'
import { QUESTION_SERVICE_URL, HISTORY_SERVICE_URL } from '../config/index.js'

export const getQuestionWithTestCases = async (
  questionId: string,
  mode: RunMode
): Promise<Question> => {
  const res = await fetch(
    `${QUESTION_SERVICE_URL}/${questionId}/test-cases?type=${mode === 'run' ? 'public' : 'all'}`
  )
  const result = (await res.json()) as {
    success: boolean
    question: Question
  }

  return result.question
}

export const createSubmissionResult = async (data: CreateSubmissionResult) => {
  await fetch(`${HISTORY_SERVICE_URL}/submissions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })
}
