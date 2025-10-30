import React from 'react'
import { Stack } from '@mui/material'
import EditorTool from './EditorTool.tsx'
import CollaborationEditor from './CollaborationEditor.tsx'
import { WebsocketProvider } from '../../../utils/y-websocket.js'
import { PeerProfile } from '../../../types/user.ts'

interface CollaborationRightPanelProps {
  provider: WebsocketProvider
  resizeTrigger: number | null
  peerProfile: PeerProfile | null
}

const CollaborationRightPanel = (props: CollaborationRightPanelProps) => {
  return (
    <Stack sx={{ height: '100%' }}>
      <EditorTool provider={props.provider} />
      <CollaborationEditor
        provider={props.provider}
        resizeTrigger={props.resizeTrigger}
        peerProfile={props.peerProfile}
      />
    </Stack>
  )
}

export default CollaborationRightPanel
