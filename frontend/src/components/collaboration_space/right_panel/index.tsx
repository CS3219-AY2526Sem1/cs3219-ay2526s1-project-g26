import React from 'react'
import { Stack } from '@mui/material'
import EditorTool from './EditorTool.tsx'
import CollaborationEditor from './CollaborationEditor.tsx'
import { WebsocketProvider } from '../../../utils/y-websocket.js'

interface CollaborationRightPanelProps {
  provider: WebsocketProvider
  resizeTrigger: number | null
}

const CollaborationRightPanel = (props: CollaborationRightPanelProps) => {
  return (
    <Stack sx={{ height: '100%' }}>
      <EditorTool provider={props.provider} />
      <CollaborationEditor
        provider={props.provider}
        resizeTrigger={props.resizeTrigger}
      />
    </Stack>
  )
}

export default CollaborationRightPanel
