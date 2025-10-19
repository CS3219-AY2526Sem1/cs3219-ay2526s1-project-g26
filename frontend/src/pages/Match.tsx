import { Container, Stack } from '@mui/material'
import { useEffect, useState } from 'react'
import { Topics } from '../components/match/Topics'
import { Difficulty } from '../components/match/Difficulty'
import { Submission } from '../components/match/Submission'
import axiosInstance from '../utils/axios'
import { API_ENDPOINTS } from '../constants/api'
import { useMatch } from '../hooks/useMatch'


const Match = () => {
  const [topicsList, setTopicsList] = useState<string[]>([])
  const [difficultyList, setDifficultyList] = useState<string[]>([])
  const [checkedTopics, setCheckedTopics] = useState<string[]>([])
  const [checkedDifficulties, setCheckedDifficulties] = useState<string[]>([])

  const { errorMsg, matchState, onMatch } = useMatch()

  useEffect(() => {
    let isMounted = true

    const fetchTopicsAndDifficulties = async () => {
      try {
        const res = await axiosInstance.get(API_ENDPOINTS.QUESTION.GET_TOPICS_AND_DIFFICULTIES)
        if (!isMounted) return
        setTopicsList(res.data.categories)
        setDifficultyList(res.data.difficulties)
      } catch (err) {
        console.error('Failed to fetch topics and difficulties', err)
      }
    }
    fetchTopicsAndDifficulties()

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

  return (
    <Container>
      <br></br>
      <Stack spacing={2}>
        <Topics
          topicsList={topicsList}
          checkedTopics={checkedTopics}
          toggleTopic={handleCheckTopic}
          toggleAllTopic={handleCheckAllTopics}
          matchState={matchState}
        />
        <Difficulty
          difficultyList={difficultyList}
          checkedDifficulties={checkedDifficulties}
          toggleDifficulty={handleCheckDifficulty}
          toggleAllDifficulty={handleCheckAllDifficulties}
          matchState={matchState}
        />
        <Submission
          checkedTopics={checkedTopics}
          checkedDifficulties={checkedDifficulties}
          errorMsg={errorMsg}
          matchState={matchState}
          onMatch={onMatch}
        />
      </Stack>
    </Container>
  )
}

export default Match
