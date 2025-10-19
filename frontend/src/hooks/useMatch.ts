import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { socket } from '../utils/socket'
import { useSelector } from 'react-redux'
import { RootState } from '../store'

type MatchState = 'IDLE' | 'ERROR' | 'WAITING' | 'MATCHED'

export function useMatch() {
  const [errorMsg, setErrorMsg] = useState<string>('')
  const [matchState, setMatchState] = useState<MatchState>('IDLE')
  const userId = useSelector((state: RootState) => state.user.user?.id)
  const navigate = useNavigate()

  useEffect(() => {
    // cleanup on unmount: ensure no leftover matchSuccess listener
    return () => {
      socket.off('matchSuccess')
      socket.off('connect_error')
    }
  }, [])

  const onMatch = useCallback((checkedTopics: string[], checkedDifficulties: string[]) => {
    if (checkedTopics.length === 0 || checkedDifficulties.length === 0) {
      setMatchState('ERROR')
      setErrorMsg('Choose at least one topic and difficulty')
      return
    }

    if (matchState === 'WAITING') return

    try {
      setMatchState('WAITING')
      socket.emit('joinMatch', {
        id: userId,
        topics: checkedTopics,
        difficulty: checkedDifficulties,
      })
      console.log("client emitted joinMatch, userId: " + userId)

      socket.on("connect_error", (err) => {
        const errorMessage = err instanceof Error ? err.message : 'Failed to connect'
        setErrorMsg(errorMessage)
        console.error("Socket connection error:", err)
        console.log(err.message);
      })

      // socket.once("matchSuccess", (res) => {
      //   const { roomId, question } = res
      //   setMatchState("MATCHED")
      //   navigate(`/collaboration/${roomId}`, { state: { question } })
      // })
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to match'
      setErrorMsg(errorMessage)
      console.error('Error in matching:', err)
    }
  }, [userId])

  const cancelMatch = useCallback(() => {
    if (userId) {
      socket.emit('cancelMatch', { id: userId })
    }
    socket.off('matchSuccess')
    socket.off('connect_error')
    setMatchState('IDLE')
  }, [userId])

  return {
    errorMsg, matchState, onMatch, cancelMatch
  }
}
