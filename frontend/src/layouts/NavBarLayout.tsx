import React from 'react'
import { Outlet } from 'react-router-dom'
import Navbar from '../components/common/NavBar.tsx'
import { Box } from '@mui/material'

const NavBarLayout = () => {
  return (
    <>
      <Navbar />
      <Box
        sx={{
          height: `calc(100vh - 64px)`,
          overflowY: 'inherit',
          padding: 1,
        }}
      >
        <Outlet />
      </Box>
    </>
  )
}

export default NavBarLayout
