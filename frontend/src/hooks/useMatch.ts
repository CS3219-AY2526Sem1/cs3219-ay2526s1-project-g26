import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { socket } from '../utils/matchingServiceSocket'
import { useSelector } from 'react-redux'
import { RootState } from '../store'
import { MatchState } from '../types/matchState'

export function useMatch() {
  const [errorMsg, setErrorMsg] = useState<string>('')
  const [matchState, setMatchState] = useState<MatchState>('IDLE')
  const userId = useSelector((state: RootState) => state.user.user?.id)
  const navigate = useNavigate()

  const cleanup = useCallback(() => {
    socket.off('matchSuccess')
    socket.off('connect_error')
    socket.off('disconnect')
    socket.off('error')
  }, [])

  useEffect(() => cleanup, [cleanup])

  const onMatch = useCallback(
    (checkedTopics: string[], checkedDifficulties: string[]) => {
      try {
        if (checkedTopics.length === 0 || checkedDifficulties.length === 0) {
          throw new Error('Choose at least one topic and difficulty')
        }

        if (matchState === 'WAITING') return
        socket.on('connect_error', (err) => {
          if (socket.active) {
            // temporary failure, the socket will automatically try to reconnect
          } else {
            // the connection was denied by the server
            // in that case, `socket.connect()` must be manually called in order to reconnect
            socket.connect()
            console.error(err.message)
            throw new Error(err.message)
          }
        })

        socket.on('disconnect', (reason, details) => {
          if (socket.active) {
            // temporary disconnection, the socket will automatically try to reconnect
          } else {
            // the connection was forcefully closed by the server or the client itself
            // in that case, `socket.connect()` must be manually called in order to reconnect
            socket.connect()
            console.log(
              'disconnected socket on client side: ' + reason + details
            )
            throw new Error(reason)
          }
        })

        setMatchState('WAITING')
        socket.emit('joinMatch', {
          id: userId,
          topics: checkedTopics,
          difficulty: checkedDifficulties,
        })

        socket.on('error', (err) => {
          throw new Error(err)
        })

        socket.on('matchSuccess', (res) => {
          console.log('User ' + userId + ' received matchSuccess event')
          const { roomid, question } = res
          setMatchState('MATCHED')
          cleanup()
          navigate(`/collaboration/${roomid}`, { state: { question } })
        })
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : 'Failed to match with unknown error'
        setErrorMsg(errorMessage)
        setMatchState('ERROR')
      }
    },
    [userId, matchState, cleanup, navigate]
  )

  const cancelMatch = useCallback(() => {
    if (userId) {
      socket.emit('cancelMatch', { id: userId })
    }
    cleanup()
    setMatchState('IDLE')
  }, [userId, cleanup])

  return {
    errorMsg,
    matchState,
    onMatch,
    cancelMatch,
  }
}
