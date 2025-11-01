import React, { useState } from 'react'
import {
  Stack,
  Button,
  Menu,
  MenuItem,
  Switch,
  FormControlLabel,
  Tooltip,
} from '@mui/material'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import { SUPPORTED_LANGUAGES } from '../../../constants/collaboration_editor.ts'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '../../../store'
import { setSelectedLanguage } from '../../../store/slices/collaborationSlice.ts'
import * as encoding from 'lib0/encoding'
import {
  messageEventSwitchLanguage,
  WebsocketProvider,
} from '../../../utils/y-websocket.js'
import aiService from '../../../services/aiService.ts'
import { setOpen as setNotificationSnackbarOpen } from '../../../store/slices/notificationSnackbarSlice.ts'

type EditorToolProps = {
  provider: WebsocketProvider | null
}

const EditorTool = ({ provider }: EditorToolProps) => {
  const dispatch = useDispatch()
  const selectedLanguage = useSelector(
    (state: RootState) => state.collaboration.selectedLanguage
  )
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null)
  const [isTranslateOptionSelected, setIsTranslateOptionSelected] =
    useState(false)
  const [isTranslating, setIsTranslating] = useState(false)
  const open = Boolean(anchorEl)

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget)
  }
  const handleClose = () => {
    setAnchorEl(null)
  }

  const handleLanguageSelect = async (
    _event: React.MouseEvent<HTMLLIElement>,
    language: string
  ) => {
    handleClose()
    if (language === selectedLanguage) return

    const fromLang = selectedLanguage

    if (isTranslateOptionSelected && provider) {
      setIsTranslating(true)
      try {
        const yText = provider.doc.getText()
        const currentCode = yText.toString()

        const translatedCode = await aiService.translateCode(
          fromLang,
          language,
          currentCode
        )

        provider.doc.transact(() => {
          yText.delete(0, yText.length)
          yText.insert(0, translatedCode)
        })
      } catch (_err) {
        dispatch(
          setNotificationSnackbarOpen({
            message: 'Something went wrong when translating the code.',
            severity: 'error',
          })
        )
      } finally {
        setIsTranslating(false)
      }
    }
    dispatch(setSelectedLanguage(language))
    const encoder = encoding.createEncoder()
    encoding.writeVarUint(encoder, messageEventSwitchLanguage)
    encoding.writeVarUint8Array(encoder, new TextEncoder().encode(language))
    provider?.ws?.send(encoding.toUint8Array(encoder))
  }

  return (
    <Stack direction="row" gap={4}>
      <Button
        id="switch-language-btn"
        aria-controls={open ? 'switch-language-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
        variant={'text'}
        endIcon={<KeyboardArrowDownIcon />}
        onClick={handleClick}
        disabled={isTranslating}
      >
        {selectedLanguage}
      </Button>
      <Menu
        id="switch-language-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        slotProps={{
          list: {
            'aria-labelledby': 'switch-language-btn',
          },
        }}
      >
        {SUPPORTED_LANGUAGES.map((language) => (
          <MenuItem
            key={language}
            onClick={(event) => handleLanguageSelect(event, language)}
            value={language}
            selected={language === selectedLanguage}
          >
            {language}
          </MenuItem>
        ))}
      </Menu>

      <Tooltip title="ON: Translate current code to the selected language. OFF: Switch language and clear the editor.">
        <span>
          <FormControlLabel
            control={
              <Switch
                checked={isTranslateOptionSelected}
                onChange={(e) => setIsTranslateOptionSelected(e.target.checked)}
                disabled={isTranslating}
                size="small"
              />
            }
            label="Translate"
            disabled={isTranslating}
          />
        </span>
      </Tooltip>
    </Stack>
  )
}

export default EditorTool
