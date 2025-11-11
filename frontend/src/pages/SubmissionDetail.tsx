/**
 * AI Assistance Disclosure:
 * Tool: Github Copilot(Claude Sonnet 4.5), date: 2025-10-17
 * Scope: Generated SubmissionDetail component including styled-components (StyledCard, ProblemTitle, StatusText), useEffect data fetching, getDifficultyColor function, and Monaco Editor integration.
 * Author review:  I validated correctness and enhanced styled-components with custom color schemes and spacing.
 */
import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Divider,
  Paper,
} from '@mui/material'
import { styled } from '@mui/material/styles'
import Editor from '@monaco-editor/react'
import { submissionsService } from '../services/submissionsService'
import { SubmissionDetail } from '../types/submissions'
import LoadingSkeleton from '../components/common/LoadingSkeleton'

// Styled components
const StyledCard = styled(Card)(({ theme }) => ({
  maxWidth: 1400,
  width: '100%',
  margin: '0 auto',
  backgroundColor: '#ffffff',
  borderRadius: 8,
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
  padding: theme.spacing(4),
  height: '100%',
}))

const ProblemTitle = styled(Typography)({
  color: '#0969da',
  textDecoration: 'underline',
  fontWeight: 600,
  fontSize: '24px',
  margin: 0,
})

const StatusText = styled(Typography)({
  color: '#28a745',
  fontWeight: 600,
  fontSize: '36px',
})

const SubmissionResult: React.FC = () => {
  // Get the submission id from URL parameters
  const { id } = useParams<{ id: string }>()

  const [submissionData, setSubmissionData] = useState<SubmissionDetail | null>(
    null
  )
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch submission data
  useEffect(() => {
    const fetchSubmission = async () => {
      if (!id) {
        setError('No submission ID provided')
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        const submission = await submissionsService.fetchSubmissionById(id)
        if (submission) {
          setSubmissionData(submission)
        } else {
          setError(`Submission with ID "${id}" not found`)
        }
      } catch (err) {
        setError('Failed to fetch submission details')
        console.error('Error fetching submission:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchSubmission()
  }, [id])

  // Show loading state
  if (loading) {
    return (
      <Box
        sx={{
          backgroundColor: '#f8f9fa',
          minHeight: '100vh',
          px: { xs: 2, sm: 4, md: 6, lg: 8 },
          py: { xs: 3, md: 4 },
        }}
      >
        <LoadingSkeleton />
      </Box>
    )
  }

  // If error or no submission found, show error message
  if (error || !submissionData) {
    return (
      <Box sx={{ backgroundColor: '#f8f9fa', minHeight: '100vh', py: 3 }}>
        <StyledCard>
          <CardContent>
            <Typography variant="h4" color="error">
              Submission Not Found
            </Typography>
            <Typography variant="body1" sx={{ mt: 2 }}>
              The submission with ID &quot;{id}&quot; could not be found.
            </Typography>
          </CardContent>
        </StyledCard>
      </Box>
    )
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'success'
      case 'medium':
        return 'warning'
      case 'hard':
        return 'error'
      default:
        return 'success'
    }
  }

  const { overall_result } = submissionData
  const testCase = overall_result.test_case_details

  return (
    <Box sx={{ height: '100vh', py: 3 }}>
      <StyledCard>
        <CardContent
          sx={{
            p: 0,
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'space-between',
            }}
          >
            {/* Left Section (Question & Stats) */}
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                flexDirection: 'column',
                gap: 2,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <ProblemTitle variant="h4">
                  {submissionData.question_title}
                </ProblemTitle>
                <Chip
                  label={`Difficulty: ${submissionData.difficulty}`}
                  color={
                    getDifficultyColor(submissionData.difficulty) as
                      | 'success'
                      | 'warning'
                      | 'error'
                  }
                  size="small"
                  sx={{ fontWeight: 600 }}
                />
              </Box>
              <Box>
                {overall_result.result === 'Accepted' ? (
                  <>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      <Typography
                        component="span"
                        variant="body2"
                        color="text.secondary"
                        sx={{ fontWeight: 500 }}
                      >
                        Runtime:{' '}
                      </Typography>
                      <Typography
                        component="span"
                        variant="body2"
                        sx={{ color: '#1f2328' }}
                      >
                        {overall_result.time_taken} ms
                      </Typography>
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      <Typography
                        component="span"
                        variant="body2"
                        color="text.secondary"
                        sx={{ fontWeight: 500 }}
                      >
                        Memory:{' '}
                      </Typography>
                      <Typography
                        component="span"
                        variant="body2"
                        sx={{ color: '#1f2328' }}
                      >
                        {overall_result.max_memory_used} mb
                      </Typography>
                    </Typography>
                  </>
                ) : overall_result.result === 'Wrong Answer' && testCase ? (
                  <Box sx={{ mb: 2 }}>
                    <Paper
                      variant="outlined"
                      sx={{
                        p: 2,
                        borderColor: '#fdaeb7',
                        backgroundColor: '#fff8f8',
                      }}
                    >
                      {/* Input */}
                      <Typography
                        variant="body1"
                        sx={{ fontWeight: 500, color: 'text.secondary' }}
                      >
                        Input
                      </Typography>
                      <Box
                        component="pre"
                        sx={{
                          p: 1.5,
                          backgroundColor: 'grey.100',
                          borderRadius: 1,
                          whiteSpace: 'pre-wrap',
                          wordBreak: 'break-all',
                          fontFamily: 'monospace',
                          mt: 0.5,
                          maxHeight: '120px',
                          overflow: 'auto',
                          // --- MODIFICATION ---
                          fontSize: '0.875rem', // Make font smaller (like body2)
                        }}
                      >
                        {testCase.input}
                      </Box>

                      {/* Expected Output */}
                      <Typography
                        variant="body1"
                        sx={{ fontWeight: 500, color: 'text.secondary', mt: 2 }}
                      >
                        Expected Output
                      </Typography>
                      <Box
                        component="pre"
                        sx={{
                          p: 1.5,
                          backgroundColor: 'grey.100',
                          borderRadius: 1,
                          whiteSpace: 'pre-wrap',
                          wordBreak: 'break-all',
                          fontFamily: 'monospace',
                          mt: 0.5,
                          maxHeight: '120px',
                          overflow: 'auto',
                          // --- MODIFICATION ---
                          fontSize: '0.875rem', // Make font smaller
                        }}
                      >
                        {testCase.expected_output}
                      </Box>

                      {/* Actual Output */}
                      <Typography
                        variant="body1"
                        sx={{ fontWeight: 500, color: 'error.dark', mt: 2 }}
                      >
                        Your Output
                      </Typography>
                      <Box
                        component="pre"
                        sx={{
                          p: 1.5,
                          backgroundColor: 'grey.100',
                          borderRadius: 1,
                          whiteSpace: 'pre-wrap',
                          wordBreak: 'break-all',
                          fontFamily: 'monospace',
                          color: 'error.main',
                          mt: 0.5,
                          maxHeight: '120px',
                          overflow: 'auto',
                          // --- MODIFICATION ---
                          fontSize: '0.875rem', // Make font smaller
                        }}
                      >
                        {testCase.actual_output || '(No output)'}
                      </Box>
                    </Paper>
                  </Box>
                ) : (
                  // <-- FALLBACK: Original block for other errors (Runtime, TLE, etc.) -->
                  <Typography
                    variant="body2"
                    sx={{
                      mb: 2,
                      color: '#d73a49',
                      fontWeight: 500,
                      backgroundColor: '#ffeef0',
                      padding: 2,
                      borderRadius: 1,
                      border: '1px solid #fdaeb7',
                      whiteSpace: 'pre-wrap',
                    }}
                  >
                    <Typography
                      component="span"
                      variant="body2"
                      sx={{ fontWeight: 600, display: 'block', mb: 1 }}
                    >
                      {overall_result.result}:
                    </Typography>
                    {overall_result.error || overall_result.output}
                  </Typography>
                )}

                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 0,
                  }}
                >
                  <Typography variant="body2">
                    <Typography
                      component="span"
                      variant="body2"
                      color="text.secondary"
                      sx={{ fontWeight: 500 }}
                    >
                      Categories:{' '}
                    </Typography>
                    <Typography
                      component="span"
                      variant="body2"
                      sx={{ color: '#1f2328' }}
                    >
                      {submissionData.categories.join(', ')}
                    </Typography>
                  </Typography>
                </Box>
              </Box>
            </Box>

            {/* Right Section (Status & Date) */}
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                textAlign: 'right',
              }}
            >
              <Box>
                <StatusText
                  sx={{
                    color:
                      overall_result.result === 'Accepted'
                        ? '#28a745'
                        : '#dc3545',
                  }}
                >
                  {overall_result.result}
                </StatusText>
                <Typography>
                  <strong>
                    {overall_result.passed_tests} /{' '}
                    {overall_result.total_tests}{' '}
                  </strong>
                  cases passed
                </Typography>
              </Box>
              <Typography variant="body2">
                <Typography
                  component="span"
                  variant="body2"
                  color="text.secondary"
                  sx={{ fontWeight: 500 }}
                >
                  Submitted at:{' '}
                </Typography>
                <Typography
                  component="span"
                  variant="body2"
                  sx={{ color: '#1f2328' }}
                >
                  {new Date(submissionData.submission_time).toLocaleString()}
                </Typography>
              </Typography>
            </Box>
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* Code Section */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              flexGrow: 1,
              minHeight: 0,
              gap: 2,
            }}
          >
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ fontWeight: 500 }}
              >
                Language:
              </Typography>
              <Typography variant="body2" sx={{ color: '#1f2328' }}>
                {submissionData.language}
              </Typography>
            </Box>
            <Box
              sx={{
                border: '1px solid #e1e4e8',
                borderRadius: 2,
                flexGrow: 1,
              }}
            >
              <Editor
                language={submissionData.language}
                value={submissionData.code}
                options={{
                  readOnly: true,
                  domReadOnly: true,
                  minimap: { enabled: true },
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  wordWrap: 'on',
                }}
              />
            </Box>
          </Box>
        </CardContent>
      </StyledCard>
    </Box>
  )
}

export default SubmissionResult
