import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { Box, Card, CardContent, Typography, Chip } from '@mui/material'
import { styled } from '@mui/material/styles'
import Editor from '@monaco-editor/react'
import { submissionsService } from '../services/submissionsService'
import { SubmissionDetailResponse } from '../types/submissions'
import LoadingSkeleton from '../components/common/LoadingSkeleton'

// Helper function to map language names to Monaco Editor language identifiers
const getMonacoLanguage = (language: string): string => {
  const languageMap: { [key: string]: string } = {
    Python: 'python',
    JavaScript: 'javascript',
    Java: 'java',
    'C++': 'cpp',
  }
  return languageMap[language] || 'plaintext'
}

// Styled components
const StyledCard = styled(Card)(({ theme }) => ({
  maxWidth: 1400,
  width: '100%',
  margin: '0 auto',
  backgroundColor: '#ffffff',
  borderRadius: 8,
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
  padding: theme.spacing(4),
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

  const [submissionData, setSubmissionData] =
    useState<SubmissionDetailResponse | null>(null)
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
          // Debugging: Unclear what is going on here, some languages produce errors
          // while others don't
          console.log(getMonacoLanguage(submission.language))
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
    <Box sx={{ backgroundColor: '#f8f9fa', minHeight: '100vh', py: 3 }}>
      <StyledCard>
        <CardContent sx={{ p: 0 }}>
          {/* Header Section */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              mb: 4,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <ProblemTitle variant="h4">{submissionData.title}</ProblemTitle>
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
            <StatusText
              sx={{
                color:
                  submissionData.status === 'Passed' ? '#28a745' : '#dc3545',
              }}
            >
              {submissionData.status}
            </StatusText>
          </Box>

          {/* Stats Section */}
          <Box sx={{ mb: 3 }}>
            <Box>
              {submissionData.status === 'Passed' ? (
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
                      {submissionData.runtime}
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
                      {submissionData.memory}
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
                  {submissionData.error_message}
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
                <Typography variant="body2" sx={{ ml: 2 }}>
                  <Typography
                    component="span"
                    variant="body2"
                    color="text.secondary"
                    sx={{ fontWeight: 500 }}
                  >
                    Date Submitted:{' '}
                  </Typography>
                  <Typography
                    component="span"
                    variant="body2"
                    sx={{ color: '#1f2328' }}
                  >
                    {submissionData.submission_time}
                  </Typography>
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Code Section */}
          <Box
            sx={{
              mt: 5,
              pt: 4,
              borderTop: '1px solid #e1e4e8',
            }}
          >
            <Box sx={{ mb: 2, display: 'flex', gap: 1, alignItems: 'center' }}>
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
                overflow: 'hidden',
                height: 400,
              }}
            >
              <Editor
                language={getMonacoLanguage(submissionData.language)}
                value={submissionData.code}
                options={{
                  readOnly: true,
                  domReadOnly: true,
                  minimap: { enabled: false },
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  wordWrap: 'on',
                  theme: 'vs-light',
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
