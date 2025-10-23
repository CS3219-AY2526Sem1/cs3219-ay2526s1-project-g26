import React, { useState } from 'react'
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Avatar,
  AvatarGroup,
  Tooltip,
} from '@mui/material'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'
import ExitToAppIcon from '@mui/icons-material/ExitToApp'
import MicIcon from '@mui/icons-material/Mic'
import MicOffIcon from '@mui/icons-material/MicOff'
import { useNavigate } from 'react-router-dom'

const TopToolBar = () => {
  const navigate = useNavigate()
  const [isMuted, setIsMuted] = useState(false)

  const handleMuteToggle = () => {
    setIsMuted((prev) => !prev)
  }

  const handleRun = () => {}

  const handleSubmit = () => {}

  const handleExit = () => {
    navigate(-1)
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
            startIcon={<PlayArrowIcon />}
            onClick={handleRun}
            sx={{ color: 'white' }}
          >
            Run
          </Button>
          <Button
            variant="contained"
            color="secondary"
            startIcon={<CloudUploadIcon />}
            onClick={handleSubmit}
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
          <AvatarGroup max={2}>
            <Tooltip title="You">
              <Avatar alt="You" sx={{ bgcolor: 'deepOrange.500' }}>
                W
              </Avatar>
            </Tooltip>
            <Tooltip title="Peer">
              <Avatar alt="Peer" sx={{ bgcolor: 'deepPurple.500' }}>
                P
              </Avatar>
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
