import { Box, Alert, Button } from '@mui/material'
import { useSelector } from 'react-redux'
import { API_ENDPOINTS } from '../../constants/api'
import { socket } from '../../utils/socket'
import { RootState } from '../../store'
import axiosInstance from '../../utils/axios'

const sessionDurationAlert =
  'Collaborative session will last 30 minutes for Easy, 45 minutes for Medium and 60 minutes for Hard'

type MatchState = 'IDLE' | 'ERROR' | 'WAITING' | 'MATCHED'

const severityMap: Record<MatchState, 'info' | 'success' | 'error'> = {
  IDLE: 'info',
  WAITING: 'info',
  MATCHED: 'success',
  ERROR: 'error',
}

export const Submission = ({
  checkedTopics,
  checkedDifficulties,
  matchState,
  changeMatchState,
}: {
  checkedTopics: string[]
  checkedDifficulties: string[]
  matchState: MatchState
  changeMatchState: (state: MatchState) => void
}) => {
  const userId = useSelector((state: RootState) => state.user.user?.id)

  const onSubmit = async () => {
    // Input validation (TODO later)

    try {
      socket.emit('joinMatch', {
        id: userId,
        topics: checkedTopics,
        difficulty: checkedDifficulties,
      })
      console.log(
        'sent joinMatch event with \ntopics: ' +
          checkedTopics +
          '\ndifficulties: ' +
          checkedDifficulties
      )

      // Wait for matchFound event from matching service (Not implemented room ids yet)
      changeMatchState('WAITING')
      // socket.on("matchFound", (data) => {
      //   const roomId = data.roomId
      // })

      // Fetch question from question service
      const questionResponse = await axiosInstance.get(
        API_ENDPOINTS.QUESTION.MATCH,
        {
          params: {
            difficulty: checkedDifficulties.join(','),
            categories: checkedTopics.join(','),
          },
        }
      )
      console.log('Fetched Question: ' + questionResponse.data.question.title)

      // Contact collab service
    } catch (err) {
      console.error('Submission Failed: ' + err)
      changeMatchState('ERROR')
    }
  }

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gridTemplateRows: '2',
        gap: 1,
        height: '10vh',
      }}
    >
      {/* Duration of session information alert */}
      <Alert sx={{ gridColumn: '1 / 3' }} severity="info">
        {sessionDurationAlert}
      </Alert>

      {/* Information bar showing match state */}
      {matchState !== 'IDLE' && (
        <Alert
          severity={severityMap[matchState]}
          sx={{ gridColumn: '4', gridRow: '1' }}
        >
          {matchState === 'WAITING' && 'Waiting for a match...'}
          {matchState === 'MATCHED' && 'Match found!'}
          {matchState === 'ERROR' && 'An error occurred while matching.'}
        </Alert>
      )}

      {/* Start Matching button */}
      <Button
        sx={{ gridColumn: '4', gridRow: '2', placeSelf: 'baseline end' }}
        variant="contained"
        size="large"
        onClick={onSubmit}
      >
        Start Matching
      </Button>
    </Box>
  )
}
