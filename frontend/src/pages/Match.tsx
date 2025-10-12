<<<<<<< HEAD
const Matching = () => {
  // eslint-disable-next-line react/react-in-jsx-scope
  return <>This is home page</>
}

export default Matching
=======
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Container,
  FormControlLabel,
  Stack,
  Typography,
} from '@mui/material'
import { check } from 'prettier'
import { useState } from 'react'

const topicsList = [
  'Arrays & Hashing',
  'Two Pointers',
  'Stack',
  'Binary Search',
  'Sliding Window',
  'Linked List',
  'Trees',
  'Tries',
  'Backtracking',
  'Heap / Priority Queue',
  'Intervals',
  'Greedy',
  'Graph',
  'Dynamic Programming',
]

const difficultyList = ['Easy', 'Medium', 'Hard']

const alert =
  'Collaborative session will last 30 minutes for Easy, 45 minutes for Medium and 60 minutes for Hard'

const Match = () => {
  const [checkedTopics, setCheckedTopics] = useState<string[]>([])
  const [checkedDifficulties, setCheckedDifficulties] = useState<string[]>([])

  // Adds topic to checkedTopics if checking the topic, else remove the topic
  const handleCheckTopic = (isChecked: boolean, topic: string) => {
    isChecked
      ? setCheckedTopics([...checkedTopics, topic])
      : setCheckedTopics(checkedTopics.filter((x) => x != topic))
  }

  // Adds difficulty to checkedDifficulty if checking the difficulty, else remove the difficulty
  const handleCheckDifficulty = (isChecked: boolean, difficulty: string) => {
    isChecked
      ? setCheckedDifficulties([...checkedDifficulties, difficulty])
      : setCheckedDifficulties(
          checkedDifficulties.filter((x) => x != difficulty)
        )
  }

  const handleCheckAllTopics = (isChecked: boolean) => {
    if (isChecked) {
      setCheckedTopics(topicsList)
    } else {
      setCheckedTopics([])
    }
  }

  const handleCheckAllDifficulties = (isChecked: boolean) => {
    if (isChecked) {
      setCheckedDifficulties(difficultyList)
    } else {
      setCheckedDifficulties([])
    }
  }

  return (
    <Container>
      <br></br>
      <Stack spacing={2}>
        <Topics
          checkedTopics={checkedTopics}
          toggleTopic={handleCheckTopic}
          toggleAllTopic={handleCheckAllTopics}
        />
        <Difficulty 
          checkedDifficulties={checkedDifficulties}
          toggleDifficulty={handleCheckDifficulty}
          toggleAllDifficulty={handleCheckAllDifficulties}
        />
        <Submission checkedTopics={checkedTopics} checkedDifficulties={checkedDifficulties}/>
      </Stack>
    </Container>
  )
}

const Topics = ({
  checkedTopics,
  toggleTopic,
  toggleAllTopic,
}: {
  checkedTopics: string[]
  toggleTopic: (isChecked: boolean, topic: string) => void
  toggleAllTopic: (isChecked: boolean) => void
}) => {
  const allSelected = checkedTopics.length === topicsList.length
  const partiallySelected = checkedTopics.length > 0 && checkedTopics.length < topicsList.length

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
              defaultChecked={false}
              checked={allSelected}
              indeterminate={partiallySelected}
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
                defaultChecked={false}
                checked={checkedTopics.includes(topic)}
                size="small"
                onChange={(e) => toggleTopic(e.target.checked, topic)}
              />
            }
            label={topic}
          />
        ))}
      </Box>
    </Box>
  )
}

const Difficulty = ({
  checkedDifficulties,
  toggleDifficulty,
  toggleAllDifficulty
}: {
  checkedDifficulties : string[],
  toggleDifficulty: (isChecked: boolean, difficulty: string) => void,
  toggleAllDifficulty: (isChecked: boolean) => void
}) => {
  const allSelected = checkedDifficulties.length === difficultyList.length
  const partiallySelected = checkedDifficulties.length > 0 && checkedDifficulties.length < difficultyList.length

  return (
    <Box>
      <Stack direction="row" spacing={4} alignItems={'center'}>
        <Typography variant="h5" sx={{ gridColumn: '1' }}>
          Difficulty
        </Typography>
        <FormControlLabel
          sx={{ gridColumn: '2' }}
          control={<Checkbox defaultChecked={false} checked={allSelected} indeterminate={partiallySelected} size="small" onChange={(e) => toggleAllDifficulty(e.target.checked)}/>}
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
                defaultChecked={false}
                checked={checkedDifficulties.includes(difficulty)}
                size="small"
                onChange={(e) => toggleDifficulty(e.target.checked, difficulty)}
              />
            }
            label={difficulty}
          />
        ))}
      </Box>
    </Box>
  )
}

const Submission = ({checkedTopics, checkedDifficulties}:{checkedTopics: string[], checkedDifficulties: string[]}) => {
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gridTemplateRows: '1',
        gap: 1,
        height: '10vh',
      }}
    >
      <Alert sx={{ gridColumn: '1 / 3' }} severity="info">
        {alert}
      </Alert>
      <Button
        sx={{ gridColumn: '4', placeSelf: 'center end' }}
        variant="contained"
        size="large"
        onClick={() => console.log(checkedTopics, checkedDifficulties)}
      >
        Start Matching
      </Button>
    </Box>
  )
}

export default Match
>>>>>>> 0fe1a11 (Add frontend)
