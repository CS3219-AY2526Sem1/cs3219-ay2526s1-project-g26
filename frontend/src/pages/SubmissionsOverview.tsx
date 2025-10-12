<<<<<<< HEAD
import React, { useState, useEffect } from 'react'
=======
import React, { useState, useEffect } from "react"
>>>>>>> 20a970d6b74a2b5073228f028189b6f29b6d5e42
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
<<<<<<< HEAD
} from '@mui/material'
=======
} from "@mui/material"
>>>>>>> 20a970d6b74a2b5073228f028189b6f29b6d5e42
import {
  FirstPage,
  KeyboardArrowLeft,
  KeyboardArrowRight,
  LastPage,
<<<<<<< HEAD
} from '@mui/icons-material'
import { useTheme } from '@mui/material/styles'
import LoadingSkeleton from '../components/common/LoadingSkeleton'
import { submissionsService } from '../services/submissionsService'
import { SubmissionDataSummary } from '../types/submissions'
=======
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles'
import LoadingSkeleton from "../components/common/LoadingSkeleton"
import { submissionsService } from "../services/submissionsService"
import { SubmissionDataSummary } from "../types/submissions"
>>>>>>> 20a970d6b74a2b5073228f028189b6f29b6d5e42

export const SubmissionsOverview = () => {
  const [submissions, setSubmissions] = useState<SubmissionDataSummary[]>([])
  const [loading, setLoading] = useState(false)
  const [pageCount, setPageCount] = useState(0)
<<<<<<< HEAD
  const [currentPage, setCurrentPage] = useState(0)
=======
  const [currentPage, setCurrentPage] = useState(1) // mui pagination starts from 1?
>>>>>>> 20a970d6b74a2b5073228f028189b6f29b6d5e42
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchSubmissions = async (): Promise<void> => {
      setLoading(true)

      try {
<<<<<<< HEAD
        const rows = await submissionsService.fetchSubmissions(
          currentPage,
=======
        // MUI Pagination is 1-indexed, but our API is 0-indexed
        const rows = await submissionsService.fetchSubmissions(
          currentPage - 1,
>>>>>>> 20a970d6b74a2b5073228f028189b6f29b6d5e42
          rowsPerPage
        )

        // Placeholder until backend is done
        // As more info is needed to calculate this properly
<<<<<<< HEAD
        // Or deciding to go with -1 instead
        setPageCount(30)

        setSubmissions(rows)
      } catch (error) {
        console.error('Error fetching submission:', error)
=======
        setPageCount(3)

        setSubmissions(rows)
      } catch (error) {
        console.error("Error fetching submission:", error)
>>>>>>> 20a970d6b74a2b5073228f028189b6f29b6d5e42
      } finally {
        setLoading(false)
      }
    }

    fetchSubmissions()
<<<<<<< HEAD
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
=======
  }, [currentPage])

  const handleChangePage = (
    event: React.MouseEvent<HTMLButtonElement> | null,
    newPage: number,
  ) => {
    setCurrentPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setCurrentPage(0);
  };

  interface TablePaginationActionsProps {
    count: number;
    page: number;
    rowsPerPage: number;
    onPageChange: (
      event: React.MouseEvent<HTMLButtonElement>,
      newPage: number,
    ) => void;
  }

  function TablePaginationActions(props: TablePaginationActionsProps) {
    const theme = useTheme();
    const { count, page, rowsPerPage, onPageChange } = props;

    const handleFirstPageButtonClick = (
      event: React.MouseEvent<HTMLButtonElement>,
    ) => {
      onPageChange(event, 0);
    };

    const handleBackButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      onPageChange(event, page - 1);
    };

    const handleNextButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      onPageChange(event, page + 1);
    };

    const handleLastPageButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      onPageChange(event, Math.max(0, Math.ceil(count / rowsPerPage) - 1));
    };
>>>>>>> 20a970d6b74a2b5073228f028189b6f29b6d5e42

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
<<<<<<< HEAD
          {theme.direction === 'rtl' ? (
            <KeyboardArrowRight />
          ) : (
            <KeyboardArrowLeft />
          )}
=======
          {theme.direction === 'rtl' ? <KeyboardArrowRight /> : <KeyboardArrowLeft />}
>>>>>>> 20a970d6b74a2b5073228f028189b6f29b6d5e42
        </IconButton>
        <IconButton
          onClick={handleNextButtonClick}
          disabled={page >= Math.ceil(count / rowsPerPage) - 1}
          aria-label="next page"
        >
<<<<<<< HEAD
          {theme.direction === 'rtl' ? (
            <KeyboardArrowLeft />
          ) : (
            <KeyboardArrowRight />
          )}
=======
          {theme.direction === 'rtl' ? <KeyboardArrowLeft /> : <KeyboardArrowRight />}
>>>>>>> 20a970d6b74a2b5073228f028189b6f29b6d5e42
        </IconButton>
        <IconButton
          onClick={handleLastPageButtonClick}
          disabled={page >= Math.ceil(count / rowsPerPage) - 1}
          aria-label="last page"
        >
          {theme.direction === 'rtl' ? <FirstPage /> : <LastPage />}
        </IconButton>
      </Box>
<<<<<<< HEAD
    )
=======
    );
>>>>>>> 20a970d6b74a2b5073228f028189b6f29b6d5e42
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
<<<<<<< HEAD
        {loading ? (
          <LoadingSkeleton />
        ) : (
=======
        {loading ? <LoadingSkeleton /> :

>>>>>>> 20a970d6b74a2b5073228f028189b6f29b6d5e42
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
                {submissions.map((submission, index) => (
                  <TableRow
                    key={index}
                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                  >
                    <TableCell component="th" scope="row">
                      {submission.title}
                    </TableCell>
<<<<<<< HEAD
                    <TableCell align="left">
                      {submission.submission_time}
                    </TableCell>
                    <TableCell align="left">
                      {submission.overall_status}
                    </TableCell>
=======
                    <TableCell align="left">{submission.submission_time}</TableCell>
                    <TableCell align="left">{submission.overall_status}</TableCell>
>>>>>>> 20a970d6b74a2b5073228f028189b6f29b6d5e42
                    <TableCell align="left">{submission.difficulty}</TableCell>
                    <TableCell align="left">{submission.language}</TableCell>
                    <TableCell align="left">
                      <Button
                        variant="contained"
<<<<<<< HEAD
                        onClick={() => {
                          navigate(`/submissions/${submission.submission_id}`)
                        }}
                      >
=======
                        onClick={
                          () => {
                            navigate(`/submissions/${submission.submission_id}`)
                          }
                        }>
>>>>>>> 20a970d6b74a2b5073228f028189b6f29b6d5e42
                        View Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TablePagination
<<<<<<< HEAD
                    rowsPerPageOptions={[5, 10, 25]}
=======
                    rowsPerPageOptions={[5, 10, 25, { label: 'All', value: -1 }]}
>>>>>>> 20a970d6b74a2b5073228f028189b6f29b6d5e42
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
<<<<<<< HEAD
        )}
=======
        }
>>>>>>> 20a970d6b74a2b5073228f028189b6f29b6d5e42
      </Box>
    </Container>
  )
}

<<<<<<< HEAD
export default SubmissionsOverview
=======
export default SubmissionsOverview
>>>>>>> 20a970d6b74a2b5073228f028189b6f29b6d5e42
