import React, { Ref, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import {
  AppBar,
  Toolbar,
  Typography,
  Tabs,
  Tab,
  Box,
  Menu,
  MenuItem,
  Button,
  Divider,
  ListItemIcon,
  ListItemText,
} from '@mui/material'
import {
  AccountCircle,
  ExitToApp,
  KeyboardArrowDown,
} from '@mui/icons-material'
import { TABS } from '../../constants/navbarTabs.ts'
import { RootState } from '../../store'
import { setActiveTab } from '../../store/slices/navbarSlice.ts'
import authService from '../../services/authService.ts'
import { logout } from '../../store/slices/userSlice.ts'
import BackgroundLetterAvatars from './BackgroundLetterAvatar.tsx'

interface NavbarProps {
  ref?: Ref<HTMLElement>
}

const Navbar = (props: NavbarProps) => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { user } = useSelector((state: RootState) => state.user)
  const { activeTab } = useSelector((state: RootState) => state.navbar)
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null)

  useEffect(() => {
    if (!window) {
      return
    }
    if (window.location.pathname !== activeTab.pathname) {
      dispatch(
        setActiveTab(
          TABS.find((tab) => tab.pathname === window.location.pathname)
        )
      )
    }
  }, [activeTab, dispatch])

  const handleTabChange = (_: React.SyntheticEvent, newTabId: string) => {
    const newActiveTab = TABS.find((tab) => tab.id === newTabId)
    dispatch(setActiveTab(newActiveTab))
    navigate(newActiveTab?.pathname || 'home')
  }

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
  }

  const handleLogout = async () => {
    handleMenuClose()
    authService.logout()
    dispatch(logout())
  }

  const handleUpdateProfile = async () => {
    handleMenuClose()
    navigate('/profile')
  }

  return (
    <AppBar position="static" color="primary" elevation={1} ref={props.ref}>
      <Toolbar sx={{ minHeight: '64px', px: 2 }}>
        <Typography
          variant="h6"
          sx={{
            fontWeight: 'bold',
            mr: 4,
            fontSize: '1.25rem',
          }}
        >
          PeerPrep
        </Typography>

        <Tabs
          value={activeTab.id}
          onChange={handleTabChange}
          textColor="inherit"
          indicatorColor="secondary"
          sx={{
            minHeight: '64px',
            '& .MuiTab-root': {
              minHeight: '64px',
              py: 1.5,
              fontSize: '0.875rem',
              fontWeight: 500,
            },
          }}
        >
          {TABS.map((tab) => (
            <Tab label={tab.label} key={tab.id} value={tab.id} />
          ))}
        </Tabs>

        <Box sx={{ display: 'flex', alignItems: 'center', ml: 'auto' }}>
          <Button
            onClick={handleMenuOpen}
            startIcon={
              <BackgroundLetterAvatars
                alt={'user profile icon'}
                content={user?.full_name || ''}
              />
            }
            endIcon={<KeyboardArrowDown />}
            sx={{
              color: 'inherit',
              textTransform: 'none',
              px: 1,
              py: 0.5,
              borderRadius: 2,
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
              },
            }}
          >
            <Box
              sx={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                maxWidth: '11rem',
              }}
            >
              <Typography
                variant="body2"
                sx={{ fontWeight: 500, ml: 1 }}
                noWrap
              >
                {user?.full_name || ' '}
              </Typography>
            </Box>
          </Button>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            PaperProps={{
              elevation: 3,
              sx: {
                mt: 1.5,
                minWidth: 200,
                borderRadius: 2,
                overflow: 'visible',
                '&:before': {
                  content: '""',
                  display: 'block',
                  position: 'absolute',
                  top: 0,
                  right: 14,
                  width: 10,
                  height: 10,
                  bgcolor: 'background.paper',
                  transform: 'translateY(-50%) rotate(45deg)',
                  zIndex: 0,
                },
              },
            }}
          >
            <MenuItem onClick={handleUpdateProfile} sx={{ py: 1.5 }}>
              <ListItemIcon>
                <AccountCircle fontSize="small" />
              </ListItemIcon>
              <ListItemText>Profile</ListItemText>
            </MenuItem>

            <Divider />

            <MenuItem
              onClick={handleLogout}
              sx={{
                py: 1.5,
                color: 'error.main',
                '&:hover': {
                  backgroundColor: 'error.light',
                  color: 'error.contrastText',
                },
              }}
            >
              <ListItemIcon>
                <ExitToApp fontSize="small" color="error" />
              </ListItemIcon>
              <ListItemText>Logout</ListItemText>
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  )
}

export default Navbar
