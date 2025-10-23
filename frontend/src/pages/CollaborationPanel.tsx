import React, { useState, useRef, useEffect } from 'react'
import { Paper, Box } from '@mui/material'
import QuestionPanel from '../components/question/QuestionPanel'
import { useAsyncEffect, useQuestion } from '../hooks'
import CollaborationRightPanel from '../components/collaboration_space/right_panel'
<<<<<<< HEAD
import { PanelGroup, Panel, PanelResizeHandle } from 'react-resizable-panels'
import { useLocation, useParams } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { RootState } from '../store'

const CollaborationPanel = () => {
  // const { question, loading, error, fetchQuestionById } = useQuestion()

  // useAsyncEffect(async () => {
  //   await fetchQuestionById('68e92415d977f66dd64f8810')
  // }, [fetchQuestionById])

  const { roomid } = useParams<{ roomid: string }>()
  const question = useSelector(
    (state: RootState) => state.collaboration.currentQuestion
  )
=======
import StyledPanelResizeHandle from '../components/collaboration_space/StyledPanelResizeHandle'
import { PanelGroup, Panel } from 'react-resizable-panels'
import TopToolBar from '../components/collaboration_space/TopToolBar'

const CollaborationPanel = () => {
  const { question, loading, error, fetchQuestionById } = useQuestion()
  const [resizeTrigger, setResizeTrigger] = useState<number | null>(null)
  const resizeTimerRef = useRef<NodeJS.Timeout | null>(null)

  useAsyncEffect(async () => {
    await fetchQuestionById('68f0c42a8e51ebfea84f8823')
  }, [fetchQuestionById])
>>>>>>> develop

  useEffect(() => {
    return () => {
      if (resizeTimerRef.current) {
        clearTimeout(resizeTimerRef.current)
      }
    }
  }, [])

  const handleResize = () => {
    if (resizeTimerRef.current) {
      clearTimeout(resizeTimerRef.current)
    }
    resizeTimerRef.current = setTimeout(
      () => void setResizeTrigger(Date.now()),
      100
    )
  }

  return (
<<<<<<< HEAD
    <PanelGroup direction={'horizontal'}>
      <Panel defaultSize={50} minSize={20}>
        <QuestionPanel
          question={question || undefined}
          loading={question ? false : true}
          error={question ? undefined : 'No question supplied'}
        />
      </Panel>
      <PanelResizeHandle
        style={{
          width: 2,
        }}
      />
      <Panel defaultSize={50}>
        <PanelGroup direction={'vertical'}>
          <Panel defaultSize={85}>
            <Paper
              elevation={1}
              sx={{
                height: '100%',
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'divider',
              }}
            >
              <CollaborationRightPanel
                roomId={roomid ? (roomid as string) : ''}
              />
            </Paper>
=======
    <>
      <TopToolBar />
      <Box
        sx={{ height: 'calc(100vh - 64px)', overflowY: 'inherit', padding: 1 }}
      >
        <PanelGroup direction={'horizontal'}>
          <Panel defaultSize={50} minSize={20} maxSize={80}>
            <QuestionPanel
              question={question || undefined}
              loading={loading}
              error={error || undefined}
            />
>>>>>>> develop
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
                    roomId={'12'}
                    resizeTrigger={resizeTrigger}
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
