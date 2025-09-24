import React from 'react'
import { Outlet } from 'react-router-dom'
import Navbar from '../components/common/NavBar.tsx'

const NavBarLayout = () => {
  return (
    <>
      <Navbar />
      <main>
        <Outlet />
      </main>
    </>
  )
}

export default NavBarLayout
