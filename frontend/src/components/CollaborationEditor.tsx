import * as Y from 'yjs'
import { WebsocketProvider } from 'y-websocket'
import { MonacoBinding } from 'y-monaco'

import React, { useEffect, useMemo, useState } from 'react'
import Editor from '@monaco-editor/react'
import * as monaco from 'monaco-editor'
import { WEBSOCKET_BASE_URL, WEBSOCKET_URL } from '../constants/api.ts'

type CollaborationEditorProps = {
  roomId: string
}

const CollaborationEditor = (props: CollaborationEditorProps) => {
  const ydoc = useMemo(() => new Y.Doc(), [])
  const [editor, setEditor] =
    useState<monaco.editor.IStandaloneCodeEditor | null>(null)
  const [provider, setProvider] = useState<WebsocketProvider | null>(null)
  const [_binding, setBinding] = useState<MonacoBinding | null>(null)

  useEffect(() => {
    const provider = new WebsocketProvider(
      `${WEBSOCKET_BASE_URL}${WEBSOCKET_URL.COLLABORATION}`,
      props.roomId,
      ydoc,
      {
        params: {
          token: localStorage.getItem('authToken') || '',
        },
      }
    )
    setProvider(provider)
    return () => {
      provider?.destroy()
      ydoc.destroy()
    }
  }, [ydoc, props.roomId])

  useEffect(() => {
    if (provider == null || editor == null) {
      return
    }
    const binding = new MonacoBinding(
      ydoc.getText(),
      editor.getModel()!,
      new Set([editor]),
      provider?.awareness
    )
    setBinding(binding)
    return () => {
      binding.destroy()
    }
  }, [ydoc, provider, editor])

  return (
    <Editor
      height="90vh"
      defaultValue=""
      defaultLanguage="javascript"
      onMount={(editor) => {
        setEditor(editor)
      }}
    />
  )
}

export default CollaborationEditor
