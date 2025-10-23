import React, { useState, useRef, useEffect } from 'react' // <-- Import new hooks
import { Paper } from '@mui/material'
import QuestionPanel from '../components/question/QuestionPanel'
import { useAsyncEffect, useQuestion } from '../hooks'
import CollaborationRightPanel from '../components/collaboration_space/right_panel'
import { PanelGroup, Panel, PanelResizeHandle } from 'react-resizable-panels'

const CollaborationPanel = () => {
  const { question, loading, error, fetchQuestionById } = useQuestion()
  const [resizeTrigger, setResizeTrigger] = useState<number | null>(null)
  const resizeTimerRef = useRef<NodeJS.Timeout | null>(null)

  useAsyncEffect(async () => {
    await fetchQuestionById('68e92415d977f66dd64f8810')
  }, [fetchQuestionById])

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
    <PanelGroup direction={'horizontal'}>
      <Panel defaultSize={50} minSize={20} maxSize={80}>
        <QuestionPanel
          question={question || undefined}
          loading={loading}
          error={error || undefined}
        />
      </Panel>
      <PanelResizeHandle
        style={{
          width: 2,
        }}
      />
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
          <PanelResizeHandle style={{ height: 2 }} />
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
  )
}

export default CollaborationPanel
