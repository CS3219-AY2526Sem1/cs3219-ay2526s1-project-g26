import React, { useState, useMemo, useEffect } from 'react'
import { Stack } from '@mui/material'
import EditorTool from './EditorTool.tsx'
import CollaborationEditor from './CollaborationEditor.tsx'
import { WebsocketProvider } from '../../../utils/y-websocket.js'
import * as Y from 'yjs'
import { useDispatch } from 'react-redux'
import { WEBSOCKET_BASE_URL, WEBSOCKET_URL } from '../../../constants/api.ts'
import { setSelectedLanguage } from '../../../store/slices/collaborationSlice.ts'

interface CollaborationRightPanelProps {
  roomId: string
  resizeTrigger: number | null
}

const CollaborationRightPanel = (props: CollaborationRightPanelProps) => {
  const [provider, setProvider] = useState<WebsocketProvider | null>(null)
  const dispatch = useDispatch()
  const ydoc = useMemo(() => new Y.Doc(), [])

  useEffect(() => {
    const provider = new WebsocketProvider(
      `${WEBSOCKET_BASE_URL}${WEBSOCKET_URL.COLLABORATION}`,
      props.roomId,
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
      }
    )
    setProvider(provider)

    return () => {
      provider?.destroy()
      ydoc.destroy()
    }
  }, [ydoc, props.roomId, dispatch])

  return (
    <Stack sx={{ height: '100%' }}>
      <EditorTool provider={provider} />
      <CollaborationEditor
        provider={provider}
        resizeTrigger={props.resizeTrigger}
      />
    </Stack>
  )
}

export default CollaborationRightPanel
