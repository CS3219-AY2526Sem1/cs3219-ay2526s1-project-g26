import {
  Box,
  Stack,
  Typography,
  FormControlLabel,
  Checkbox,
} from '@mui/material'
import { MatchState } from '../../types/matchState'

export const Difficulty = ({
  difficultyList,
  checkedDifficulties,
  toggleDifficulty,
  toggleAllDifficulty,
  matchState,
}: {
  difficultyList: string[]
  checkedDifficulties: string[]
  toggleDifficulty: (isChecked: boolean, difficulty: string) => void
  toggleAllDifficulty: (isChecked: boolean) => void
  matchState: MatchState
}) => {
  const allSelected = checkedDifficulties.length === difficultyList.length
  const partiallySelected =
    checkedDifficulties.length > 0 &&
    checkedDifficulties.length < difficultyList.length
  const isWaiting = matchState === 'WAITING'

  return (
    <Box>
      <Stack direction="row" spacing={4} alignItems={'center'}>
        <Typography variant="h5" sx={{ gridColumn: '1' }}>
          Difficulty
        </Typography>
        <FormControlLabel
          sx={{ gridColumn: '2' }}
          control={
            <Checkbox
              checked={allSelected}
              indeterminate={partiallySelected}
              disabled={isWaiting}
              size="small"
              onChange={(e) => toggleAllDifficulty(e.target.checked)}
            />
          }
          label={'Select All'}
        />
      </Stack>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gridTemplateRows: '1',
          gridAutoFlow: 'row',
          gap: 0.8,
          height: '10vh',
        }}
      >
        {difficultyList.map((difficulty) => (
          <FormControlLabel
            key={difficulty}
            control={
              <Checkbox
                checked={checkedDifficulties.includes(difficulty)}
                disabled={isWaiting}
                size="small"
                onChange={(e) => toggleDifficulty(e.target.checked, difficulty)}
              />
            }
            label={difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
          />
        ))}
      </Box>
    </Box>
  )
}
