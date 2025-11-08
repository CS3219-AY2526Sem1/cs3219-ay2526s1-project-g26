import React, { useState, useRef, useEffect, useMemo } from 'react'
import { Paper, Box } from '@mui/material'
import LeftPanel from '../components/collaboration_space/left_panel'
import CollaborationRightPanel from '../components/collaboration_space/right_panel'
import StyledPanelResizeHandle from '../components/collaboration_space/StyledPanelResizeHandle'
import { PanelGroup, Panel } from 'react-resizable-panels'
import TopToolBar from '../components/collaboration_space/TopToolBar'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { WEBSOCKET_BASE_URL, WEBSOCKET_URL } from '../constants/api.ts'
import {
  setSelectedLanguage,
  setTargetTranslatedLanguage,
  setTranslatedCode,
} from '../store/slices/collaborationSlice.ts'
import * as Y from 'yjs'
import { useDispatch, useSelector } from 'react-redux'
import { WebsocketProvider } from '../utils/y-websocket.js'
import { setIsCodeExecuting } from '../store/slices/collaborationSlice.ts'
import { RootState } from '../store'
import submissionService from '../services/submissionsService.ts'
import { setOpen as setNotificationBarOpen } from '../store/slices/notificationSnackbarSlice.ts'
import { PeerProfile } from '../types/user.ts'
import LoadingSkeleton from '../components/common/LoadingSkeleton.tsx'
import { DEFAULT_LANGUAGE } from '../constants/collaboration_editor.ts'

const CollaborationPanel = () => {
  const me = useSelector((state: RootState) => state.user.user)
  const [resizeTrigger, setResizeTrigger] = useState<number | null>(null)
  const resizeTimerRef = useRef<NodeJS.Timeout | null>(null)
  const { roomid } = useParams<{ roomid: string }>()
  const location = useLocation()
  const question = location.state?.question
  const [provider, setProvider] = useState<WebsocketProvider | undefined>()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const ydoc = useMemo(() => new Y.Doc(), [])
  const [peerProfile, setPeerProfile] = useState<PeerProfile | null>(null)

  useEffect(() => {
    return () => {
      if (resizeTimerRef.current) {
        clearTimeout(resizeTimerRef.current)
      }
      dispatch(setSelectedLanguage(DEFAULT_LANGUAGE))
      dispatch(setTargetTranslatedLanguage(null))
      dispatch(setTranslatedCode(null))
    }
  }, [dispatch])

  useEffect(() => {
    if (!roomid || !me) return
    const provider = new WebsocketProvider(
      `${WEBSOCKET_BASE_URL}${WEBSOCKET_URL.COLLABORATION}`,
      roomid,
      ydoc,
      {
        params: {
          token: localStorage.getItem('authToken') || '',
        },
      },
      {
        onSwitchLanguage: (language) => {
          dispatch(setSelectedLanguage(language))
        },
        onCodeSubmitted: (ticketId) => {
          dispatch(setIsCodeExecuting(true))
          const n = setInterval(async () => {
            const result =
              await submissionService.getSubmissionStatusByTicketId(ticketId!)
            if (!result) return
            dispatch(
              setNotificationBarOpen({
                message: JSON.stringify(result),
                severity: 'success',
              })
            )
            dispatch(setIsCodeExecuting(false))
            clearInterval(n)
          }, 500)
          setTimeout(() => clearInterval(n), 30000)
        },
        onExit: (id) => {
          const peerId = id
          if (peerId !== me?.id) {
            dispatch(
              setNotificationBarOpen({
                message: 'Session ended by peer',
                severity: 'info',
              })
            )
          }
          provider?.destroy()
          ydoc.destroy()
          navigate(-1)
        },
      }
    )
    setProvider(provider)
    provider.awareness.setLocalStateField('id', me?.id)
    provider.awareness.setLocalStateField('user', {
      fullName: me?.full_name,
      id: me?.id,
      email: me?.email,
    } as PeerProfile)
    provider.awareness.on('change', () => {
      const targetClientId: number | undefined = Array.from(
        provider.awareness.getStates().keys()
      ).find((val) => val !== provider.awareness.clientID)
      if (!targetClientId) return
      const peerInfo: PeerProfile | undefined = provider.awareness
        .getStates()
        .get(targetClientId)?.user
      if (!peerInfo) return
      setPeerProfile(peerInfo)
    })
    return () => {
      provider?.destroy()
      ydoc.destroy()
    }
  }, [ydoc, roomid, me, navigate, dispatch])

  if (!question) {
    return <Box>No Question has been supplied.</Box>
  }

  const handleResize = () => {
    if (resizeTimerRef.current) {
      clearTimeout(resizeTimerRef.current)
    }
    resizeTimerRef.current = setTimeout(
      () => void setResizeTrigger(Date.now()),
      100
    )
  }

  if (!peerProfile) {
    return <LoadingSkeleton />
  }

  return (
    <>
      <TopToolBar
        provider={provider}
        questionId={question._id}
        peerProfile={peerProfile}
        roomId={roomid}
      />
      <Box
        sx={{ height: 'calc(100vh - 64px)', overflowY: 'inherit', padding: 1 }}
      >
        <PanelGroup direction={'horizontal'}>
          <Panel defaultSize={50} minSize={20} maxSize={80}>
            <Paper
              elevation={1}
              sx={{
                height: '100%',
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'divider',
                overflow: 'hidden',
              }}
            >
              <LeftPanel question={question || undefined} roomId={roomid || undefined} provider={provider} />
            </Paper>
          </Panel>

          <StyledPanelResizeHandle />

          <Panel defaultSize={50} maxSize={80} minSize={20}>
            <PanelGroup direction={'vertical'}>
              <Panel
                defaultSize={85}
                maxSize={95}
                minSize={20}
                onResize={handleResize}
              >
                <Paper
                  elevation={1}
                  sx={{
                    height: '100%',
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: 'divider',
                    overflow: 'hidden',
                  }}
                >
                  <CollaborationRightPanel
                    peerProfile={peerProfile}
                    resizeTrigger={resizeTrigger}
                    provider={provider!}
                  />
                </Paper>
              </Panel>

              <StyledPanelResizeHandle />

              <Panel defaultSize={15} minSize={5} maxSize={80}>
                <Paper
                  elevation={1}
                  sx={{
                    height: '100%',
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: 'divider',
                  }}
                >
                  Test Case Panel (Reserved)
                </Paper>
              </Panel>
            </PanelGroup>
          </Panel>
        </PanelGroup>
      </Box>
    </>
  )
}

export default CollaborationPanel
