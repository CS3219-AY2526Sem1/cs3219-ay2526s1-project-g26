import React from 'react'
import { Paper } from '@mui/material'
import QuestionPanel from '../components/question/QuestionPanel'
import { useAsyncEffect, useQuestion } from '../hooks'
import CollaborationRightPanel from '../components/collaboration_space/right_panel'
import { PanelGroup, Panel, PanelResizeHandle } from 'react-resizable-panels'

const CollaborationPanel = () => {
  const { question, loading, error, fetchQuestionById } = useQuestion()

  useAsyncEffect(async () => {
    await fetchQuestionById('68e92415d977f66dd64f8810')
  }, [fetchQuestionById])

  return (
    <PanelGroup direction={'horizontal'}>
      <Panel defaultSize={50} minSize={20}>
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
              <CollaborationRightPanel roomId={'12'} />
            </Paper>
          </Panel>
          <PanelResizeHandle style={{ height: 2 }} />
          <Panel defaultSize={15}>
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
