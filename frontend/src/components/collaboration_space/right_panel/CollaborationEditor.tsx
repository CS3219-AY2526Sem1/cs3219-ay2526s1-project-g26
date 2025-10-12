import * as Y from 'yjs'
import { WebsocketProvider } from '../../../utils/y-websocket.js'
import { MonacoBinding } from 'y-monaco'

import React, {
  Dispatch,
  SetStateAction,
  useEffect,
  useMemo,
  useState,
} from 'react'
import Editor from '@monaco-editor/react'
import * as monaco from 'monaco-editor'
import { WEBSOCKET_BASE_URL, WEBSOCKET_URL } from '../../../constants/api.ts'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '../../../store'
import { setSelectedLanguage } from '../../../store/slices/collaborationSlice.ts'
import { DEFAULT_LANGUAGE } from '../../../constants/collaboration_editor.ts'

type CollaborationEditorProps = {
  roomId: string
  provider: WebsocketProvider | null
  setProvider: Dispatch<SetStateAction<WebsocketProvider | null>>
}

const CollaborationEditor = ({
  provider,
  setProvider,
  roomId,
}: CollaborationEditorProps) => {
  const dispatch = useDispatch()
  const ydoc = useMemo(() => new Y.Doc(), [])
  const [editor, setEditor] =
    useState<monaco.editor.IStandaloneCodeEditor | null>(null)
  const { selectedLanguage } = useSelector(
    (state: RootState) => state.collaboration
  )
  const [_binding, setBinding] = useState<MonacoBinding | null>(null)

  useEffect(() => {
    const provider = new WebsocketProvider(
      `${WEBSOCKET_BASE_URL}${WEBSOCKET_URL.COLLABORATION}`,
      roomId,
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
  }, [ydoc, roomId])

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
      defaultLanguage={DEFAULT_LANGUAGE}
      language={selectedLanguage}
      options={{ minimap: { enabled: false } }}
      onMount={(editor) => {
        setEditor(editor)
      }}
    />
  )
}

export default CollaborationEditor
