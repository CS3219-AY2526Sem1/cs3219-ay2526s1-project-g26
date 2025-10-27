import React from 'react'
import { Box, Alert, Button, CircularProgress } from '@mui/material'
import type { MatchState } from '../../types/matchState'

const sessionDurationAlert =
  'Collaborative session will last 30 minutes for Easy, 45 minutes for Medium and 60 minutes for Hard'

export const Submission = ({
  checkedTopics,
  checkedDifficulties,
  errorMsg,
  matchState,
  onMatch,
  cancelMatch,
}: {
  checkedTopics: string[]
  checkedDifficulties: string[]
  errorMsg: string
  matchState: MatchState
  onMatch: (checkedTopics: string[], checkedDifficulties: string[]) => void
  cancelMatch: () => void
}) => {
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
        <Box sx={{ gridColumn: '4', gridRow: '1' }}>
          {matchState === 'WAITING' && <CircularProgress />}
          {matchState === 'MATCHED' && (
            <Alert severity="success">Match found!</Alert>
          )}
          {matchState === 'ERROR' && <Alert severity="error">{errorMsg}</Alert>}
        </Box>
      )}

      {/* Start Matching button (When IDLE or ERROR)*/}
      {(matchState === 'IDLE' || matchState === 'ERROR') && (
        <Button
          sx={{ gridColumn: '4', gridRow: '2', placeSelf: 'center end' }}
          variant="contained"
          size="large"
          onClick={() => onMatch(checkedTopics, checkedDifficulties)}
        >
          Start Matching
        </Button>
      )}
      {/* Cancel Matching button (When WAITING or MATCHED) */}
      {(matchState === 'WAITING' || matchState === 'MATCHED') && (
        <Button
          sx={{ gridColumn: '4', gridRow: '2', placeSelf: 'center end' }}
          variant="contained"
          size="large"
          onClick={() => cancelMatch()}
        >
          Cancel Matching
        </Button>
      )}
    </Box>
  )
}
