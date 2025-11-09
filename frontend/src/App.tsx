import React, { lazy, useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Login from './pages/Login'
import SignUp from './pages/SignUp'
import { useAsyncEffect } from './hooks'
import { useDispatch, useSelector } from 'react-redux'
import authService from './services/authService.ts'
import { loginSuccess } from './store/slices/userSlice.ts'
import { UserSlice } from './types/auth.ts'
import { RootState } from './store'
import { Navigate, Outlet } from 'react-router-dom'
import LoadingSkeleton from './components/common/LoadingSkeleton.tsx'
import NavBarLayout from './layouts/NavBarLayout.tsx'
import SubmissionsOverview from './pages/SubmissionsOverview.tsx'
import Home from './pages/Home.tsx'
import UpdateProfile from './pages/UpdateProfile.tsx'
import Match from './pages/Match.tsx'
import CollaborationPanel from './pages/CollaborationPanel.tsx'
import SubmissionDetail from './pages/SubmissionDetail.tsx'
import ForgotPassword from './pages/ForgotPassword.tsx'
import ResetPassword from './pages/ResetPassword.tsx'

const NotificationSnackbar = lazy(
  () => import('./components/common/NotificationSnackbar.tsx')
)

const ProtectedRoutes = () => {
  const dispatch = useDispatch()
  const { isAuthenticated } = useSelector((state: RootState) => state.user)
  const [isLoading, setIsLoading] = useState(true)

  useAsyncEffect(async () => {
    if (!isAuthenticated) {
      try {
        const response = await authService.verifyToken()
        dispatch(loginSuccess(response.user as UserSlice))
      } catch (_error) {
        /* empty */
      }
    }
    setIsLoading(false)
  }, [isAuthenticated, dispatch])

  if (isLoading) {
    return <LoadingSkeleton />
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />
}

function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to={'home'} />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route element={<ProtectedRoutes />}>
            <Route element={<NavBarLayout />}>
              <Route path="/home" element={<Home />} />
              <Route path="/submissions" element={<SubmissionsOverview />} />
              <Route path="/match" element={<Match />} />
            </Route>
            <Route
              path="/collaboration/:roomid"
              element={<CollaborationPanel />}
            />
            <Route path="/submissions/:id" element={<SubmissionDetail />} />
          </Route>
          <Route path="/update-profile" element={<UpdateProfile />} />
        </Routes>
      </Router>
      <NotificationSnackbar />
    </>
  )
}

export default App
