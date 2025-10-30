import React, { useState } from 'react'
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  AvatarGroup,
  Tooltip,
  CircularProgress,
} from '@mui/material'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'
import ExitToAppIcon from '@mui/icons-material/ExitToApp'
import MicIcon from '@mui/icons-material/Mic'
import MicOffIcon from '@mui/icons-material/MicOff'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '../../store'
import {
  messageEventCodeSubmitted,
  WebsocketProvider,
} from '../../utils/y-websocket'
import { setIsCodeExecuting } from '../../store/slices/collaborationSlice'
import * as encoding from 'lib0/encoding'
import BackgroundLetterAvatar from '../common/BackgroundLetterAvatar.tsx'
import { PeerProfile } from '../../types/user.ts'

interface TopToolBarProps {
  provider: WebsocketProvider | null
  questionId: string | null
  peerProfile: PeerProfile | null
}

const TopToolBar = (props: TopToolBarProps) => {
  const me = useSelector((state: RootState) => state.user.user)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [isMuted, setIsMuted] = useState(false)
  const { isCodeExecuting, selectedLanguage } = useSelector(
    (state: RootState) => state.collaboration
  )

  const handleMuteToggle = () => {
    setIsMuted((prev) => !prev)
  }

  const handleExit = () => {
    navigate(-1)
  }

  const onRun = () => {
    dispatch(setIsCodeExecuting(true))
    const encoder = encoding.createEncoder()
    encoding.writeVarUint(encoder, messageEventCodeSubmitted)
    encoding.writeVarUint8Array(
      encoder,
      new TextEncoder().encode(
        JSON.stringify({
          language: selectedLanguage,
          mode: 'run',
          questionId: props.questionId,
        })
      )
    )
    props.provider?.ws?.send(encoding.toUint8Array(encoder))
  }

  const onSubmit = () => {
    dispatch(setIsCodeExecuting(true))
    const encoder = encoding.createEncoder()
    encoding.writeVarUint(encoder, messageEventCodeSubmitted)
    encoding.writeVarUint8Array(
      encoder,
      new TextEncoder().encode(
        JSON.stringify({
          language: selectedLanguage,
          mode: 'submit',
          questionId: props.questionId,
        })
      )
    )
    props.provider?.ws?.send(encoding.toUint8Array(encoder))
  }

  return (
    <AppBar position="static" color="primary" elevation={1}>
      <Toolbar sx={{ minHeight: '64px', px: 2 }}>
        <Typography
          variant="h6"
          sx={{
            fontWeight: 'bold',
            fontSize: '1.25rem',
            minWidth: '150px',
          }}
        >
          PeerPrep
        </Typography>

        <Box
          sx={{
            flexGrow: 1,
            display: 'flex',
            justifyContent: 'center',
            gap: 2,
          }}
        >
          <Button
            variant="contained"
            color="success"
            startIcon={
              isCodeExecuting ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                <PlayArrowIcon />
              )
            }
            onClick={onRun}
            disabled={isCodeExecuting}
            sx={{ color: 'white' }}
          >
            Run
          </Button>
          <Button
            variant="contained"
            color="secondary"
            startIcon={
              isCodeExecuting ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                <CloudUploadIcon />
              )
            }
            onClick={onSubmit}
            disabled={isCodeExecuting}
          >
            Submit
          </Button>
        </Box>

        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: 2,
            minWidth: '150px',
          }}
        >
          <AvatarGroup max={2} spacing="medium">
            <Tooltip title="Me">
              <BackgroundLetterAvatar
                content={me?.full_name || ''}
                alt={'My profile icon'}
              />
            </Tooltip>
            <Tooltip title={props.peerProfile?.fullName || ''}>
              <BackgroundLetterAvatar
                alt="Peer's profile icon"
                content={props.peerProfile?.fullName || ''}
              />
            </Tooltip>
          </AvatarGroup>

          <Tooltip title={isMuted ? 'Unmute' : 'Mute'}>
            <IconButton onClick={handleMuteToggle} color="inherit">
              {isMuted ? <MicOffIcon /> : <MicIcon />}
            </IconButton>
          </Tooltip>

          <Tooltip title="Exit Session">
            <IconButton onClick={handleExit} color="warning">
              <ExitToAppIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Toolbar>
    </AppBar>
  )
}

export default TopToolBar
