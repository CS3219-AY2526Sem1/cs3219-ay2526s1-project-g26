import React, { useState } from 'react'
import { Stack } from '@mui/material'
import EditorTool from './EditorTool.tsx'
import CollaborationEditor from './CollaborationEditor.tsx'
import { type WebsocketProvider } from '../../../utils/y-websocket.js'

const CollaborationRightPanel = () => {
  const [provider, setProvider] = useState<WebsocketProvider | null>(null)

  return (
    <Stack sx={{ height: '100%' }}>
      <EditorTool provider={provider} />
      <CollaborationEditor
        roomId={'12'}
        provider={provider}
        setProvider={setProvider}
      />
    </Stack>
  )
}

export default CollaborationRightPanel
