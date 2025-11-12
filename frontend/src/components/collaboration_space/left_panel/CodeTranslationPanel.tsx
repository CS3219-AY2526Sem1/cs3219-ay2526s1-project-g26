import React, { useEffect, useState } from 'react'
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  CircularProgress,
  Typography,
} from '@mui/material'
import { Editor } from '@monaco-editor/react'
import { type WebsocketProvider } from '../../../utils/y-websocket'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '../../../store'
import aiService from '../../../services/aiService.ts'
import {
  DEFAULT_LANGUAGE,
  SUPPORTED_LANGUAGES,
} from '../../../constants/collaboration_editor.ts'
import {
  setTargetTranslatedLanguage,
  setTranslatedCode,
} from '../../../store/slices/collaborationSlice.ts'

interface CodeTranslationPanelProps {
  provider: WebsocketProvider | undefined
}

const CodeTranslationPanel = (props: CodeTranslationPanelProps) => {
  const { provider } = props
  const dispatch = useDispatch()
  const sourceLanguage = useSelector(
    (state: RootState) => state.collaboration.selectedLanguage
  )

  const LANGUAGES_ITEMS = SUPPORTED_LANGUAGES.filter(
    (val) => val !== sourceLanguage
  ).map((val) => ({
    label: val,
    value: val,
  }))

  const { targetTranslatedLanguage, translatedCode } = useSelector(
    (state: RootState) => state.collaboration
  )
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (sourceLanguage === targetTranslatedLanguage) {
      dispatch(setTargetTranslatedLanguage(LANGUAGES_ITEMS[0].value))
    }
  }, [targetTranslatedLanguage, dispatch, sourceLanguage, LANGUAGES_ITEMS])

  const handleSubmitTranslation = async () => {
    if (!provider || !targetTranslatedLanguage || !sourceLanguage) {
      setError('Cannot submit translation. Provider or language not available.')
      return
    }
    const code = provider.doc.getText().toString()
    if (!code) {
      setError('Cannot translate empty code.')
      return
    }

    setIsLoading(true)
    setError(null)
    try {
      const translatedCode = await aiService.translateCode(
        sourceLanguage,
        targetTranslatedLanguage,
        code
      )
      dispatch(setTranslatedCode(translatedCode))
    } catch (_err) {
      setError('Something went wrong.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        padding: 2,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
        <FormControl fullWidth size="small">
          <InputLabel id="target-language-label">Target Language</InputLabel>
          <Select
            labelId="target-language-label"
            value={targetTranslatedLanguage}
            label="Target Language"
            onChange={(e) =>
              void dispatch(setTargetTranslatedLanguage(e.target.value))
            }
          >
            {LANGUAGES_ITEMS.map((lang) => (
              <MenuItem key={lang.value} value={lang.value}>
                {lang.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Box sx={{ position: 'relative' }}>
          <Button
            variant="contained"
            onClick={handleSubmitTranslation}
            disabled={isLoading}
            sx={{ minWidth: 100 }}
          >
            Translate
          </Button>
          {isLoading && (
            <CircularProgress
              size={24}
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                marginTop: '-12px',
                marginLeft: '-12px',
              }}
            />
          )}
        </Box>
      </Box>

      {error && (
        <Typography color="error" variant="body2" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}

      <Box sx={{ flexGrow: 1, border: '1px solid', borderColor: 'divider' }}>
        <Editor
          height="100%"
          language={targetTranslatedLanguage || DEFAULT_LANGUAGE}
          value={translatedCode || ''}
          options={{
            readOnly: true,
            domReadOnly: true,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            wordWrap: 'on',
          }}
        />
      </Box>
    </Box>
  )
}

export default CodeTranslationPanel
