import React, { useState, useRef, useEffect } from 'react'
import { Paper, Box } from '@mui/material'
import QuestionPanel from '../components/question/QuestionPanel'
import CollaborationRightPanel from '../components/collaboration_space/right_panel'
import StyledPanelResizeHandle from '../components/collaboration_space/StyledPanelResizeHandle'
import { PanelGroup, Panel } from 'react-resizable-panels'
import TopToolBar from '../components/collaboration_space/TopToolBar'
import { useLocation, useParams } from 'react-router-dom'

const CollaborationPanel = () => {
  const [resizeTrigger, setResizeTrigger] = useState<number | null>(null)
  const resizeTimerRef = useRef<NodeJS.Timeout | null>(null)
  const { roomid } = useParams<{ roomid: string }>()
  const location = useLocation()
  const question = location.state?.question

  // State for code execution
  const [executeRun, setExecuteRun] = useState<(() => void) | null>(null)
  const [executeSubmit, setExecuteSubmit] = useState<(() => void) | null>(null)
  const [executing, setExecuting] = useState(false)

  // Receive execute functions from CollaborationRightPanel
  const handleExecuteReady = (
    runFn: () => void,
    submitFn: () => void,
    loadingState: boolean
  ) => {
    setExecuteRun(() => runFn)
    setExecuteSubmit(() => submitFn)
    setExecuting(loadingState)
  }

  useEffect(() => {
    return () => {
      if (resizeTimerRef.current) {
        clearTimeout(resizeTimerRef.current)
      }
    }
  }, [])

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

  return (
    <>
      <TopToolBar
        onRun={executeRun || (() => {})}
        onSubmit={executeSubmit || (() => {})}
        loading={executing}
      />
      <Box
        sx={{ height: 'calc(100vh - 64px)', overflowY: 'inherit', padding: 1 }}
      >
        <PanelGroup direction={'horizontal'}>
          <Panel defaultSize={50} minSize={20} maxSize={80}>
            <QuestionPanel question={question || undefined} />
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
                    roomId={roomid ? roomid : ''}
                    resizeTrigger={resizeTrigger}
                    questionId={question.id}
                    onExecuteReady={handleExecuteReady}
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
