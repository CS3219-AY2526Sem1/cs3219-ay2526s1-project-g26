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
import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '../store'
// import { socket } from '../socket'
import { io } from 'socket.io-client'
import { Topics } from '../components/match/topics'
import { Difficulty } from '../components/match/difficulty'

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

const sessionDurationAlert =
  'Collaborative session will last 30 minutes for Easy, 45 minutes for Medium and 60 minutes for Hard'

const socket = io("http://localhost:4020")

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
          topicsList={topicsList}
          checkedTopics={checkedTopics}
          toggleTopic={handleCheckTopic}
          toggleAllTopic={handleCheckAllTopics}
        />
        <Difficulty 
          difficultyList={difficultyList}
          checkedDifficulties={checkedDifficulties}
          toggleDifficulty={handleCheckDifficulty}
          toggleAllDifficulty={handleCheckAllDifficulties}
        />
        <Submission checkedTopics={checkedTopics} checkedDifficulties={checkedDifficulties}/>
      </Stack>
    </Container>
  )
}

const Submission = ({checkedTopics, checkedDifficulties}:{checkedTopics: string[], checkedDifficulties: string[]}) => {
  const userId = useSelector((state: RootState) => state.user.user?.id)
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
        {sessionDurationAlert}
      </Alert>
      <Typography sx={{ gridColumn: '3 / 4', placeSelf: 'center end'}} color="red">
        {/* TODO */}
      </Typography>
      <Button
        sx={{ gridColumn: '4', placeSelf: 'center end' }}
        variant="contained"
        size="large"
        onClick={() => {
          // Input validation (TODO later)
          // user send checked topics/difficulty to backend
          // backend respond with room id if successfully matched
          // user fetch a question from question service
          // user recv question + room id, sends this to collab service
          console.log(checkedTopics, checkedDifficulties)
          socket.emit("joinMatch", {
            id: userId, 
            topics: checkedTopics, 
            difficulty: checkedDifficulties
          })
          
        }}
  
      >
        Start Matching
      </Button>
    </Box>
  )
}

// function handleMatchFound({roomId}) {
//   try {
//     // Fetch a question from question service

//     socket.emit("startSession", {roomId, question})

//     // Navigate to collab page
//   } catch (err) {
//     console.error("Failed to start a match", err)
//   }
// }

export default Match
