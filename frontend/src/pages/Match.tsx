import { Container, Stack } from '@mui/material'
import { useEffect, useState } from 'react'
import { io } from 'socket.io-client'
import { Topics } from '../components/match/topics'
import { Difficulty } from '../components/match/difficulty'
import { Submission } from '../components/match/submission'
import axiosInstance from '../utils/axios'
import { API_ENDPOINTS } from '../constants/api'

// const topicsList = [
//   'Arrays & Hashing',
//   'Two Pointers',
//   'Stack',
//   'Binary Search',
//   'Sliding Window',
//   'Linked List',
//   'Trees',
//   'Tries',
//   'Backtracking',
//   'Heap / Priority Queue',
//   'Intervals',
//   'Greedy',
//   'Graph',
//   'Dynamic Programming',
// ]

// const difficultyList = ['Easy', 'Medium', 'Hard']

type MatchState = 'IDLE' | 'ERROR' | 'WAITING' | 'MATCHED'

const socket = io('http://localhost:4020')

const Match = () => {
  const [matchState, setMatchState] = useState<MatchState>('IDLE')
  const [topicsList, setTopicsList] = useState<string[]>([])
  const [difficultyList, setDifficultyList] = useState<string[]>([])
  const [checkedTopics, setCheckedTopics] = useState<string[]>([])
  const [checkedDifficulties, setCheckedDifficulties] = useState<string[]>([])

  useEffect(() => {
    let isMounted = true

    const fetchOptions = async () => {
      try {
        const res = await axiosInstance.get(API_ENDPOINTS.QUESTION.GET_OPTIONS)
        if (!isMounted) return
        setTopicsList(res.data.categories || [])
        setDifficultyList(res.data.difficulties || [])
      } catch (err) {
        console.error('Failed to fetch topics and difficulties', err)
      }
    }
    fetchOptions()

    return () => {
      isMounted = false
    }
  }, [])

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

  const changeMatchState = (state: MatchState) => {
    setMatchState(state)
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
        <Submission
          checkedTopics={checkedTopics}
          checkedDifficulties={checkedDifficulties}
          matchState={matchState}
          changeMatchState={changeMatchState}
        />
      </Stack>
    </Container>
  )
}

export default Match
