import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Divider,
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
      case 'Easy':
        return 'success'
      case 'Medium':
        return 'warning'
      case 'Hard':
        return 'error'
      default:
        return 'success'
    }
  }

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
                {submissionData.overall_result.result === 'Accepted' ? (
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
                        {submissionData.overall_result.time_taken} ms
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
                        {submissionData.overall_result.max_memory_used} mb
                      </Typography>
                    </Typography>
                  </>
                ) : (
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
                    }}
                  >
                    <Typography
                      component="span"
                      variant="body2"
                      sx={{ fontWeight: 600, display: 'block', mb: 1 }}
                    >
                      Error:
                    </Typography>
                    {submissionData.overall_result.error ||
                      submissionData.overall_result.output}
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
                      submissionData.overall_result.result === 'Accepted'
                        ? '#28a745'
                        : '#dc3545',
                  }}
                >
                  {submissionData.overall_result.result}
                </StatusText>
                <Typography>
                  <strong>
                    {submissionData.overall_result.passed_tests} /{' '}
                    {submissionData.overall_result.total_tests}{' '}
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
