import React from 'react'
import {
  Box,
  Stack,
  Typography,
  FormControlLabel,
  Checkbox,
} from '@mui/material'
import { MatchState } from '../../types/matchState'

export const Topics = ({
  topicsList,
  checkedTopics,
  toggleTopic,
  toggleAllTopic,
  matchState,
}: {
  topicsList: string[]
  checkedTopics: string[]
  toggleTopic: (isChecked: boolean, topic: string) => void
  toggleAllTopic: (isChecked: boolean) => void
  matchState: MatchState
}) => {
  const allSelected = checkedTopics.length === topicsList.length
  const partiallySelected =
    checkedTopics.length > 0 && checkedTopics.length < topicsList.length
  const isWaiting = matchState === 'WAITING'

  return (
    <Box>
      <Stack direction="row" spacing={4} alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="h5" sx={{ gridColumn: '1' }}>
          Topics
        </Typography>
        <FormControlLabel
          sx={{ gridColumn: '2' }}
          control={
            <Checkbox
              checked={allSelected}
              indeterminate={partiallySelected}
              disabled={isWaiting}
              size="small"
              onChange={(e) => toggleAllTopic(e.target.checked)}
            />
          }
          label="Select All"
        />
      </Stack>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gridTemplateRows: 'repeat(6, 1fr)',
          gridAutoFlow: 'row',
          gap: 0.8,
          overflowY: 'auto',
          height: '40vh',
        }}
      >
        {topicsList.map((topic) => (
          <FormControlLabel
            key={topic}
            control={
              <Checkbox
                checked={checkedTopics.includes(topic)}
                disabled={isWaiting}
                size="small"
                onChange={(e) => toggleTopic(e.target.checked, topic)}
              />
            }
            label={topic.charAt(0).toUpperCase() + topic.slice(1)}
          />
        ))}
      </Box>
    </Box>
  )
}
