import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Paper,
  Container,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableFooter,
  TablePagination,
  TableRow,
  TableCell,
  Button,
  IconButton,
} from '@mui/material'
import {
  FirstPage,
  KeyboardArrowLeft,
  KeyboardArrowRight,
  LastPage,
} from '@mui/icons-material'
import { useTheme } from '@mui/material/styles'
import LoadingSkeleton from '../components/common/LoadingSkeleton'
import { submissionsService } from '../services/submissionsService'
import { SubmissionDataSummary } from '../types/submissions'
import authService from '../services/authService'

export const SubmissionsOverview = () => {
  const [submissions, setSubmissions] = useState<SubmissionDataSummary[]>([])
  const [loading, setLoading] = useState(false)
  const [pageCount, setPageCount] = useState(0)
  const [currentPage, setCurrentPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchSubmissions = async (): Promise<void> => {
      setLoading(true)

      try {
        const userId = (await authService.verifyToken()).user?.id
        
        const rows = await submissionsService.fetchSubmissions(
          userId,
          currentPage,
          rowsPerPage
        )

        // Placeholder until backend is done
        // As more info is needed to calculate this properly
        // Or deciding to go with -1 instead
        setPageCount(30)

        setSubmissions(rows)
      } catch (error) {
        console.error('Error fetching submission:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchSubmissions()
  }, [rowsPerPage, currentPage])

  const handleChangePage = (
    event: React.MouseEvent<HTMLButtonElement> | null,
    newPage: number
  ) => {
    setCurrentPage(newPage)
  }

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setCurrentPage(0)
  }

  interface TablePaginationActionsProps {
    count: number
    page: number
    rowsPerPage: number
    onPageChange: (
      event: React.MouseEvent<HTMLButtonElement>,
      newPage: number
    ) => void
  }

  function TablePaginationActions(props: TablePaginationActionsProps) {
    const theme = useTheme()
    const { count, page, rowsPerPage, onPageChange } = props

    const handleFirstPageButtonClick = (
      event: React.MouseEvent<HTMLButtonElement>
    ) => {
      onPageChange(event, 0)
    }

    const handleBackButtonClick = (
      event: React.MouseEvent<HTMLButtonElement>
    ) => {
      onPageChange(event, page - 1)
    }

    const handleNextButtonClick = (
      event: React.MouseEvent<HTMLButtonElement>
    ) => {
      onPageChange(event, page + 1)
    }

    const handleLastPageButtonClick = (
      event: React.MouseEvent<HTMLButtonElement>
    ) => {
      onPageChange(event, Math.max(0, Math.ceil(count / rowsPerPage) - 1))
    }

    return (
      <Box sx={{ flexShrink: 0, ml: 2.5 }}>
        <IconButton
          onClick={handleFirstPageButtonClick}
          disabled={page === 0}
          aria-label="first page"
        >
          {theme.direction === 'rtl' ? <LastPage /> : <FirstPage />}
        </IconButton>
        <IconButton
          onClick={handleBackButtonClick}
          disabled={page === 0}
          aria-label="previous page"
        >
          {theme.direction === 'rtl' ? (
            <KeyboardArrowRight />
          ) : (
            <KeyboardArrowLeft />
          )}
        </IconButton>
        <IconButton
          onClick={handleNextButtonClick}
          disabled={page >= Math.ceil(count / rowsPerPage) - 1}
          aria-label="next page"
        >
          {theme.direction === 'rtl' ? (
            <KeyboardArrowLeft />
          ) : (
            <KeyboardArrowRight />
          )}
        </IconButton>
        <IconButton
          onClick={handleLastPageButtonClick}
          disabled={page >= Math.ceil(count / rowsPerPage) - 1}
          aria-label="last page"
        >
          {theme.direction === 'rtl' ? <FirstPage /> : <LastPage />}
        </IconButton>
      </Box>
    )
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        {loading ? (
          <LoadingSkeleton />
        ) : (
          <TableContainer component={Paper}>
            <Table sx={{ minWidth: 650 }} size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Problem</TableCell>
                  <TableCell align="left">When</TableCell>
                  <TableCell align="left">Status</TableCell>
                  <TableCell align="left">Difficulty</TableCell>
                  <TableCell align="left">Lang</TableCell>
                  <TableCell align="left">Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {submissions.map((submission) => (
                  <TableRow
                    key={submission.submission_id}
                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                  >
                    <TableCell component="th" scope="row">
                      {submission.title}
                    </TableCell>
                    <TableCell align="left">
                      {submission.submission_time}
                    </TableCell>
                    <TableCell align="left">
                      {submission.overall_status}
                    </TableCell>
                    <TableCell align="left">{submission.difficulty}</TableCell>
                    <TableCell align="left">{submission.language}</TableCell>
                    <TableCell align="left">
                      <Button
                        variant="contained"
                        onClick={() => {
                          navigate(`/submissions/${submission.submission_id}`)
                        }}
                      >
                        View Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TablePagination
                    rowsPerPageOptions={[5, 10, 25]}
                    colSpan={3}
                    count={pageCount}
                    rowsPerPage={rowsPerPage}
                    page={currentPage}
                    slotProps={{
                      select: {
                        inputProps: {
                          'aria-label': 'rows per page',
                        },
                        native: true,
                      },
                    }}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    ActionsComponent={TablePaginationActions}
                  />
                </TableRow>
              </TableFooter>
            </Table>
          </TableContainer>
        )}
      </Box>
    </Container>
  )
}

export default SubmissionsOverview
