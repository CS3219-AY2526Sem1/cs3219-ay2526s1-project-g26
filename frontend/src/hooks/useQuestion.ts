import { useState, useCallback } from 'react'
import { questionService, Question } from '../services/questionService'

interface UseQuestionReturn {
  question: Question | null
  loading: boolean
  error: string | null
  fetchQuestionById: (id: number) => Promise<void>
  clearQuestion: () => void
}

export const useQuestion = (): UseQuestionReturn => {
  const [question, setQuestion] = useState<Question | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchQuestionById = useCallback(async (id: number) => {
    setLoading(true)
    setError(null)

    try {
      const fetchedQuestion = await questionService.getQuestionById(id)
      setQuestion(fetchedQuestion)
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to fetch question'
      setError(errorMessage)
      console.error('Error fetching question:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  const clearQuestion = useCallback(() => {
    setQuestion(null)
    setError(null)
  }, [])

  return {
    question,
    loading,
    error,
    fetchQuestionById,
    clearQuestion,
  }
}
