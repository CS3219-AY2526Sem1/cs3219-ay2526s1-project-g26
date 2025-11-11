import React from 'react'
import {
  Box,
  Paper,
  Container,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Typography,
} from '@mui/material'
import { useSelector } from 'react-redux'
import { RootState } from '../../../store'
import { formatDistanceToNow } from 'date-fns'

export const SubmissionsPanel = () => {
  const submissions = useSelector(
    (state: RootState) => state.collaboration.submissions
  )

  const handleRowClick = (submissionId: string) => {
    window.open(`/submissions/${submissionId}`, '_blank')?.focus()
  }

  const capitalize = (s: string) => {
    if (typeof s !== 'string' || s.length === 0) return s
    return s.charAt(0).toUpperCase() + s.slice(1)
  }

  const headerCellStyle = {
    fontWeight: 600,
    backgroundColor: 'grey.50',
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Typography variant="h5" component="h2" sx={{ mb: 2 }}>
          Submission History
        </Typography>

        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 650 }} size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={headerCellStyle} width="5%">
                  No.
                </TableCell>
                <TableCell sx={headerCellStyle}>Status</TableCell>
                <TableCell sx={headerCellStyle} align="left">
                  When
                </TableCell>
                <TableCell sx={headerCellStyle} align="left">
                  Lang
                </TableCell>
                <TableCell sx={headerCellStyle} align="left">
                  Mode
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {submissions.map((submission, index) => (
                <TableRow
                  key={submission.submission_id}
                  hover
                  onClick={() => handleRowClick(submission.submission_id)}
                  sx={{
                    '&:last-child td, &:last-child th': { border: 0 },
                    cursor: 'pointer',
                  }}
                >
                  <TableCell component="th" scope="row">
                    {index + 1}
                  </TableCell>
                  <TableCell
                    align="left"
                    sx={{
                      color:
                        submission.status === 'Accepted'
                          ? 'success.main'
                          : 'error.main',

                      fontWeight: 600,
                    }}
                  >
                    {submission.status}
                  </TableCell>

                  <TableCell align="left">
                    {formatDistanceToNow(new Date(submission.submitted_at), {
                      addSuffix: true,
                    })}
                  </TableCell>

                  <TableCell align="left">{submission.language}</TableCell>

                  <TableCell align="left">
                    {capitalize(submission.mode)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Container>
  )
}

export default SubmissionsPanel
