import React, { useState, useEffect } from "react"
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Paper,
  Container,
  Pagination,
  Stack,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Button,
} from "@mui/material"
import LoadingSkeleton from "../components/common/LoadingSkeleton"
import { submissionsService } from "../services/submissionsService"
import { SubmissionDataSummary } from "../types/submissions"

const Submissions: React.FC = () => {
  const [posts, setPosts] = useState<SubmissionDataSummary[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [pageCount, setPageCount] = useState<number>(0)
  const [currentPage, setCurrentPage] = useState<number>(1) // MUI Pagination starts from 1
  const postsPerPage = 10

  useEffect(() => {
    const fetchPosts = async (): Promise<void> => {
      setLoading(true)

      try {
        // MUI Pagination is 1-indexed, but our API is 0-indexed
        const result = await submissionsService.fetchSubmissions(
          currentPage - 1,
          postsPerPage
        )

        // Placeholder until backend is done
        // As more info is needed to calculate this properly
        setPageCount(3) 

        setPosts(result)
      } catch (error) {
        console.error("Error fetching posts:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchPosts()
  }, [currentPage])

  const handlePageChange = (
    event: React.ChangeEvent<unknown>,
    value: number
  ): void => {
    setCurrentPage(value)
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        {loading ? <LoadingSkeleton /> : <PostList posts={posts} />}

        {pageCount > 1 && (
          <Stack spacing={2} alignItems="center" sx={{ mt: 4 }}>
            <Pagination
              count={pageCount}
              page={currentPage}
              onChange={handlePageChange}
              color="primary"
              size="large"
              showFirstButton
              showLastButton
            />
          </Stack>
        )}
      </Box>
    </Container>
  )
}

const PostList: React.FC<{ posts: SubmissionDataSummary[] }> = ({ posts }) => {
  const navigate = useNavigate()
  
  return (
    <TableContainer component={Paper}>
      <Table sx={{ minWidth: 650 }} size="small" aria-label="a dense table">
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
          {posts.map((post, index) => (
            <TableRow
              key={index}
              sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
            >
              <TableCell component="th" scope="row">
                {post.title}
              </TableCell>
              <TableCell align="left">{post.submission_time}</TableCell>
              <TableCell align="left">{post.overall_status}</TableCell>
              <TableCell align="left">{post.difficulty}</TableCell>
              <TableCell align="left">{post.language}</TableCell>
              <TableCell align="left">
                <Button 
                variant="contained" 
                onClick={
                  () => {
                    navigate(`/submissions/${post.submission_id}`)
                  }
                }>
                  View Details
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )
}

export default Submissions