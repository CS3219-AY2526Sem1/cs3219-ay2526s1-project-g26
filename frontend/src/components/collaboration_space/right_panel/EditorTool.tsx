import React from 'react'
import { Stack, Button, Menu, MenuItem } from '@mui/material'
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

type EditorToolProps = {
  provider: WebsocketProvider | null
}

const EditorTool = ({ provider }: EditorToolProps) => {
  const dispatch = useDispatch()
  const selectedLanguage = useSelector(
    (state: RootState) => state.collaboration.selectedLanguage
  )
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null)
  const open = Boolean(anchorEl)
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget)
  }
  const handleClose = () => {
    setAnchorEl(null)
  }

  const handleLanguageSwitch = (
    _event: React.MouseEvent<HTMLLIElement>,
    language: string
  ) => {
    handleClose()
    dispatch(setSelectedLanguage(language))
    const encoder = encoding.createEncoder()
    encoding.writeVarUint(encoder, messageEventSwitchLanguage)
    encoding.writeVarUint8Array(encoder, new TextEncoder().encode(language))
    provider?.ws?.send(encoding.toUint8Array(encoder))
  }

  return (
    <Stack direction="row" justifyContent="space-between" alignItems="center">
      <div>
        <Button
          id="switch-language-btn"
          aria-controls={open ? 'switch-language-menu' : undefined}
          aria-haspopup="true"
          aria-expanded={open ? 'true' : undefined}
          variant={'text'}
          endIcon={<KeyboardArrowDownIcon />}
          onClick={handleClick}
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
              onClick={(event) => handleLanguageSwitch(event, language)}
              value={language}
              selected={language === selectedLanguage}
            >
              {language}
            </MenuItem>
          ))}
        </Menu>
      </div>
    </Stack>
  )
}

export default EditorTool
