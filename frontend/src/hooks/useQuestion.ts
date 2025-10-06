import { useState, useCallback } from 'react'
import { questionService, Question } from '../services/questionService'

interface UseQuestionReturn {
  question: Question | null
  loading: boolean
  error: string | null
  fetchRandomQuestion: (difficulty?: string) => Promise<void>
  fetchQuestionById: (id: number) => Promise<void>
  clearQuestion: () => void
}

export const useQuestion = (): UseQuestionReturn => {
  const [question, setQuestion] = useState<Question | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)


  const fetchRandomQuestion = useCallback(async (difficulty: string = 'easy') => {
    setLoading(true)
    setError(null)
    
    try {
      //console.log(`Fetching random question with difficulty: ${difficulty}`)
      const fetchedQuestion = await questionService.getRandomQuestion(difficulty)
      setQuestion(fetchedQuestion)
    } catch (err) {
      console.error('Detailed error information:', err)
      
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosError = err as any
        console.error('Response status:', axiosError.response?.status)
        console.error('Response data:', axiosError.response?.data)
        console.error('Response headers:', axiosError.response?.headers)
        
        if (axiosError.response?.status === 500) {
          setError(`Server error: ${axiosError.response?.data?.message || 'Internal server error'}`)
        } else if (axiosError.response?.status === 401) {
          setError('Authentication required')
        } else {
          setError(`HTTP ${axiosError.response?.status}: ${axiosError.response?.data?.message || 'Unknown error'}`)
        }
      } else {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch random question'
        setError(errorMessage)
      }
      
      console.error('Error fetching random question:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchQuestionById = useCallback(async (id: number) => {
    setLoading(true)
    setError(null)
    
    try {
      console.log(`Fetching question with ID: ${id}`)
      const fetchedQuestion = await questionService.getQuestionById(id)
      setQuestion(fetchedQuestion)
    } catch (err) {
      console.error('Detailed error information:', err)
      
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosError = err as any
        console.error('Response status:', axiosError.response?.status)
        console.error('Response data:', axiosError.response?.data)
        
        if (axiosError.response?.status === 404) {
          setError(`Question with ID ${id} not found`)
        } else if (axiosError.response?.status === 500) {
          setError(`Server error: ${axiosError.response?.data?.message || 'Internal server error'}`)
        } else {
          setError(`HTTP ${axiosError.response?.status}: ${axiosError.response?.data?.message || 'Unknown error'}`)
        }
      } else {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch question'
        setError(errorMessage)
      }
      
      console.error('Error fetching question by ID:', err)
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
    fetchRandomQuestion,
    fetchQuestionById,
    clearQuestion,
  }
}