import { WebsocketProvider } from '../../../utils/y-websocket.js'
import { MonacoBinding } from 'y-monaco'

import React, { useEffect, useState } from 'react'
import Editor from '@monaco-editor/react'
import * as monaco from 'monaco-editor'
import { useSelector } from 'react-redux'
import { RootState } from '../../../store'
import { DEFAULT_LANGUAGE } from '../../../constants/collaboration_editor.ts'
import { PeerProfile } from '../../../types/user.ts'
import { ScopedCssBaseline } from '@mui/material'
import { stringToColor } from '../../../utils'

type CollaborationEditorProps = {
  provider: WebsocketProvider | null
  resizeTrigger: number | null
  peerProfile: PeerProfile | null
}

const CollaborationEditor = ({
  provider,
  resizeTrigger,
  peerProfile,
}: CollaborationEditorProps) => {
  const [editor, setEditor] =
    useState<monaco.editor.IStandaloneCodeEditor | null>(null)
  const { selectedLanguage } = useSelector(
    (state: RootState) => state.collaboration
  )
  const [_binding, setBinding] = useState<MonacoBinding | null>(null)

  useEffect(() => {
    if (provider == null || editor == null) {
      return
    }
    const binding = new MonacoBinding(
      provider.doc.getText(),
      editor.getModel()!,
      new Set([editor]),
      provider?.awareness
    )
    setBinding(binding)
    return () => {
      binding.destroy()
    }
  }, [provider, editor])

  useEffect(() => {
    if (editor && resizeTrigger) {
      editor.layout()
    }
  }, [editor, resizeTrigger])

  return (
    <ScopedCssBaseline
      sx={{
        '& .yRemoteSelection': {
          opacity: 0.8,
          backgroundColor: stringToColor(peerProfile?.fullName || ' '),
          marginRight: -1,
        },
        '& .yRemoteSelectionHead': {
          position: 'absolute',
          boxSizing: 'border-box',
          height: '100%',
          borderLeft: `2px solid ${stringToColor(peerProfile?.fullName || ' ')}`,
        },
        height: '100%',
      }}
    >
      <Editor
        defaultLanguage={DEFAULT_LANGUAGE}
        language={selectedLanguage}
        options={{
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          automaticLayout: false,
        }}
        onMount={(editor) => {
          setEditor(editor)
        }}
      />
    </ScopedCssBaseline>
  )
}

export default CollaborationEditor
