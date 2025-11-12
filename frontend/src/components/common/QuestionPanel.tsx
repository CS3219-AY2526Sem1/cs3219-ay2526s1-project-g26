/**
 * AI Assistance Disclosure:
 * Tool: Github Copilot(Claude Sonnet 4.5), date: 2025-10-08
 * Scope: Generated the QuestionPanel component with basic MUI layout, ReactMarkdown integration, and accordion structure for examples and constraints.
 * Author review:  I validated correctness and enhanced markdown rendering with custom styles for code blocks and lists and refined category chip layout and colors.
 */
import React from 'react'
import {
  Box,
  Typography,
  Chip,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Alert,
  CircularProgress,
  Stack,
} from '@mui/material'
import {
  ExpandMore as ExpandMoreIcon,
  Lightbulb as LightbulbIcon,
} from '@mui/icons-material'
import ReactMarkdown from 'react-markdown'
import { Question } from '../../types/question.ts'

interface QuestionPanelProps {
  question?: Question
  loading?: boolean
  error?: string
  onQuestionChange?: (question: Question) => void
}

const QuestionPanel: React.FC<QuestionPanelProps> = ({
  question,
  loading = false,
  error,
}) => {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'easy':
        return 'success'
      case 'medium':
        return 'warning'
      case 'hard':
        return 'error'
      default:
        return 'default'
    }
  }

  const markdownStyles = {
    lineHeight: 1.6,
    '& p': {
      margin: '0 0 16px 0',
    },
    '& h1, & h2, & h3, & h4, & h5, & h6': {
      marginTop: '24px',
      marginBottom: '16px',
      fontWeight: 'bold',
    },
    '& code': {
      backgroundColor: 'grey.100',
      padding: '2px 4px',
      borderRadius: 1,
      fontFamily: 'monospace',
      fontSize: '0.875rem',
    },
    '& pre': {
      backgroundColor: 'grey.100',
      padding: '16px',
      borderRadius: 1,
      overflow: 'auto',
      fontFamily: 'monospace',
      fontSize: '0.875rem',
    },
    '& ul, & ol': {
      paddingLeft: '24px',
      marginBottom: '16px',
    },
    '& li': {
      marginBottom: '4px',
    },
    '& blockquote': {
      borderLeft: '4px solid #ddd',
      paddingLeft: '16px',
      margin: '16px 0',
      fontStyle: 'italic',
    },
  }

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="100%"
        minHeight="400px"
      >
        <CircularProgress />
      </Box>
    )
  }

  if (error) {
    return (
      <Box p={2}>
        <Alert severity="error">{error}</Alert>
      </Box>
    )
  }

  if (!question) {
    return (
      <Box p={2}>
        <Alert severity="info">No question selected</Alert>
      </Box>
    )
  }

  return (
    <Box sx={{ padding: 1 }}>
      {/* title and difficulty */}
      <Stack direction="row" spacing={2} alignItems="center" mb={2}>
        <Typography variant="h5" component="h1" fontWeight="bold">
          {question.title}
        </Typography>
        <Chip
          label={question.difficulty}
          color={
            getDifficultyColor(question.difficulty) as
              | 'success'
              | 'warning'
              | 'error'
              | 'default'
          }
          size="small"
          variant="outlined"
        />
      </Stack>

      {/* categories (tags) */}
      {question.categories && question.categories.length > 0 && (
        <Stack direction="row" spacing={1} mb={2} flexWrap="wrap" useFlexGap>
          {question.categories.map((category, index) => (
            <Chip
              key={index}
              label={category}
              size="small"
              variant="filled"
              sx={{
                backgroundColor: 'rgba(0, 0, 0, 0.08)',
                color: 'text.secondary',
                fontWeight: 500,
                fontSize: '0.75rem',
                '&:hover': {
                  backgroundColor: 'rgba(0, 0, 0, 0.12)',
                },
              }}
            />
          ))}
        </Stack>
      )}

      <Divider sx={{ mb: 3 }} />

      {/* description */}
      <Box mb={3}>
        <Typography variant="h6" gutterBottom fontWeight="medium">
          Description
        </Typography>
        <Box sx={markdownStyles}>
          <ReactMarkdown>{question.description}</ReactMarkdown>
        </Box>
      </Box>

      {/* input/output format */}
      {(question.input || question.output) && (
        <Box mb={3}>
          <Typography variant="h6" gutterBottom fontWeight="medium">
            Input/Output Format
          </Typography>
          <Stack spacing={2}>
            {question.input && (
              <Box>
                <Typography
                  variant="body1"
                  gutterBottom
                  sx={{ fontWeight: 'medium' }}
                >
                  Input:
                </Typography>
                <Box sx={markdownStyles}>
                  <ReactMarkdown>{question.input}</ReactMarkdown>
                </Box>
              </Box>
            )}
            {question.output && (
              <Box>
                <Typography
                  variant="body1"
                  gutterBottom
                  sx={{ fontWeight: 'medium' }}
                >
                  Output:
                </Typography>
                <Box sx={markdownStyles}>
                  <ReactMarkdown>{question.output}</ReactMarkdown>
                </Box>
              </Box>
            )}
          </Stack>
        </Box>
      )}

      {/* constraints */}
      {question.constraints &&
        Array.isArray(question.constraints) &&
        question.constraints.length > 0 && (
          <Box mb={3}>
            <Typography variant="h6" gutterBottom fontWeight="medium">
              Constraints
            </Typography>
            <Stack spacing={1}>
              {question.constraints.map((constraint: string, index: number) => (
                <Box
                  key={index}
                  sx={{ display: 'flex', alignItems: 'flex-start' }}
                >
                  <Typography variant="body1" sx={{ minWidth: '16px', mr: 1 }}>
                    •
                  </Typography>
                  <Box sx={{ ...markdownStyles, flex: 1 }}>
                    <ReactMarkdown>{constraint}</ReactMarkdown>
                  </Box>
                </Box>
              ))}
            </Stack>
          </Box>
        )}

      {/* examples */}
      {question.examples &&
        Array.isArray(question.examples) &&
        question.examples.length > 0 && (
          <Box mb={3}>
            <Typography variant="h6" gutterBottom fontWeight="medium">
              Examples
            </Typography>
            <Stack spacing={2}>
              {question.examples.map(
                (example: { input: string; output: string }, index: number) => (
                  <Box key={index}>
                    <Typography
                      variant="body1"
                      gutterBottom
                      sx={{ fontWeight: 'medium' }}
                    >
                      Example {index + 1}:
                    </Typography>
                    <Stack spacing={1}>
                      <Box>
                        <Typography
                          variant="subtitle2"
                          color="text.secondary"
                          gutterBottom
                        >
                          Input:
                        </Typography>
                        <Box
                          component="pre"
                          sx={{
                            backgroundColor: 'grey.50',
                            p: 2,
                            borderRadius: 1,
                            border: '1px solid',
                            borderColor: 'grey.200',
                            fontFamily: 'monospace',
                            fontSize: '0.875rem',
                            overflow: 'auto',
                          }}
                        >
                          {example.input}
                        </Box>
                      </Box>
                      <Box>
                        <Typography
                          variant="subtitle2"
                          color="text.secondary"
                          gutterBottom
                        >
                          Output:
                        </Typography>
                        <Box
                          component="pre"
                          sx={{
                            backgroundColor: 'grey.50',
                            p: 2,
                            borderRadius: 1,
                            border: '1px solid',
                            borderColor: 'grey.200',
                            fontFamily: 'monospace',
                            fontSize: '0.875rem',
                            overflow: 'auto',
                          }}
                        >
                          {example.output}
                        </Box>
                      </Box>
                    </Stack>
                  </Box>
                )
              )}
            </Stack>
          </Box>
        )}

      {/* hints */}
      {question.hints &&
        Array.isArray(question.hints) &&
        question.hints.length > 0 && (
          <Accordion>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="hints-content"
              id="hints-header"
            >
              <Stack direction="row" spacing={1} alignItems="center">
                <LightbulbIcon color="warning" />
                <Typography variant="h6" fontWeight="medium">
                  Hints
                </Typography>
              </Stack>
            </AccordionSummary>
            <AccordionDetails>
              <Stack spacing={2}>
                {question.hints.map((hint: string, index: number) => (
                  <Box
                    key={index}
                    sx={{ display: 'flex', alignItems: 'flex-start' }}
                  >
                    <Typography
                      variant="body2"
                      sx={{ minWidth: '24px', mr: 1, fontWeight: 'medium' }}
                    >
                      {index + 1}.
                    </Typography>
                    <Box sx={{ ...markdownStyles, flex: 1 }}>
                      <ReactMarkdown>{hint}</ReactMarkdown>
                    </Box>
                  </Box>
                ))}
              </Stack>
            </AccordionDetails>
          </Accordion>
        )}
    </Box>
  )
}

export default QuestionPanel
