import React from 'react'
import {
  Box,
  Paper,
  Typography,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemText,
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
import { Question } from '../../services/questionService'

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
  onQuestionChange,
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
    <Paper
      elevation={1}
      sx={{
        height: '100%',
        overflow: 'auto',
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Box p={3}>
        {/* title and difficulty */}
        <Stack direction="row" spacing={2} alignItems="center" mb={2}>
          <Typography variant="h5" component="h1" fontWeight="bold">
            {question.title}
          </Typography>
          <Chip
            label={question.difficulty}
            color={getDifficultyColor(question.difficulty) as any}
            size="small"
            variant="outlined"
          />
        </Stack>

        <Divider sx={{ mb: 3 }} />

        {/* description */}
        <Box mb={3}>
          <Typography variant="h6" gutterBottom fontWeight="medium">
            Description
          </Typography>
          <Typography
            variant="body1"
            sx={{
              whiteSpace: 'pre-wrap',
              lineHeight: 1.6,
              '& code': {
                backgroundColor: 'grey.100',
                padding: '2px 4px',
                borderRadius: 1,
                fontFamily: 'monospace',
              },
            }}
          >
            {question.description}
          </Typography>
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
                  <Typography variant="body1" gutterBottom sx={{ fontWeight: 'medium' }}>
                    Input:
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{
                      whiteSpace: 'pre-wrap',
                      lineHeight: 1.6,
                      '& code': {
                        backgroundColor: 'grey.100',
                        padding: '2px 4px',
                        borderRadius: 1,
                        fontFamily: 'monospace',
                      },
                    }}
                  >
                    {question.input}
                  </Typography>
                </Box>
              )}
              {question.output && (
                <Box>
                  <Typography variant="body1" gutterBottom sx={{ fontWeight: 'medium' }}>
                    Output:
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{
                      whiteSpace: 'pre-wrap',
                      lineHeight: 1.6,
                      '& code': {
                        backgroundColor: 'grey.100',
                        padding: '2px 4px',
                        borderRadius: 1,
                        fontFamily: 'monospace',
                      },
                    }}
                  >
                    {question.output}
                  </Typography>
                </Box>
              )}
            </Stack>
          </Box>
        )}

        {/* constraints */}
        {question.constraints && Array.isArray(question.constraints) && question.constraints.length > 0 && (
          <Box mb={3}>
            <Typography variant="h6" gutterBottom fontWeight="medium">
              Constraints
            </Typography>
            <List dense>
              {question.constraints.map((constraint: string, index: number) => (
                <ListItem key={index} sx={{ py: 0.5 }}>
                  <ListItemText
                    primary={
                      <Typography variant="body1" component="span">
                        • {constraint}
                      </Typography>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </Box>
        )}

        {/* examples */}
        {question.examples && Array.isArray(question.examples) && question.examples.length > 0 && (
          <Box mb={3}>
            <Typography variant="h6" gutterBottom fontWeight="medium">
              Examples
            </Typography>
            <Stack spacing={2}>
              {question.examples.map((example: any, index: number) => (
                <Box key={index}>
                  <Typography variant="body1" gutterBottom sx={{ fontWeight: 'medium' }}>
                    Example {index + 1}:
                  </Typography>
                  <Stack spacing={1}>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
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
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
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
              ))}
            </Stack>
          </Box>
        )}

        {/* hints */}
        {question.hints && Array.isArray(question.hints) && question.hints.length > 0 && (
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
              <List>
                {question.hints.map((hint: string, index: number) => (
                  <ListItem key={index} sx={{ py: 0.5 }}>
                    <ListItemText
                      primary={
                        <Typography variant="body2" component="span">
                          {index + 1}. {hint}
                        </Typography>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </AccordionDetails>
          </Accordion>
        )}
      </Box>
    </Paper>
  )
}

export default QuestionPanel