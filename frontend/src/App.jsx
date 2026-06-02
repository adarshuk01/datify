import React, { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/authStore'
import { connectSocket, disconnectSocket } from './services/socketService'

import SplashScreen      from './pages/SplashScreen'
import OnboardingPage    from './pages/onboarding/OnboardingPage'
import LoginPage         from './pages/auth/LoginPage'
import SignupPage        from './pages/auth/SignupPage'
import VerifyEmailPage   from './pages/auth/VerifyEmailPage'
import ProfileSetupPage  from './pages/profile/ProfileSetupPage'
import FindingNearbyPage from './pages/main/FindingNearbyPage'
import HomePage          from './pages/main/HomePage'
import MatchesPage       from './pages/main/MatchesPage'
import ChatsPage         from './pages/main/ChatsPage'
import ChatRoomPage      from './pages/main/ChatRoomPage'
import ProfilePage       from './pages/main/ProfilePage'
import EditProfilePage   from './pages/main/EditProfilePage'
import SearchPage        from './pages/main/SearchPage'
import ViewProfilePage   from './pages/main/ViewProfilePage'
import MainLayout        from './components/main/MainLayout'

const PublicRoute = ({ children }) => {
  const { isAuthenticated } = useAuthStore()
  return !isAuthenticated ? children : <Navigate to="/main/home" replace />
}

const PrivateRoute = ({ children }) => {
  const { isAuthenticated } = useAuthStore()
  return isAuthenticated ? children : <Navigate to="/login" replace />
}

const MainRoute = ({ children }) => {
  const { isAuthenticated, user } = useAuthStore()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  const hasCoords =
    Array.isArray(user?.location?.coordinates) &&
    user.location.coordinates.length === 2
  if (!hasCoords) return <Navigate to="/profile-setup" replace />
  return children
}

function App() {
  const { isAuthenticated, token, user } = useAuthStore()

  useEffect(() => {
    if (isAuthenticated && token) {
      const uid = String(user?.id || user?._id || '')
      connectSocket(token, uid)
    } else {
      disconnectSocket()
    }
  }, [isAuthenticated, token, user])

  return (
    <BrowserRouter>
      {/*
        Phone-frame wrapper:
        - On desktop: centers a 390px column with a shadow (looks like a phone)
        - On real mobile: w-full fills the screen, max-w-sm has no effect
        - overflow-x-hidden prevents any horizontal bleed from children
        - overflow-y is handled per-page (each page owns its scroll)
      */}
      <div className="min-h-screen bg-gray-100 flex items-start justify-center">
        <div className="w-full max-w-sm min-h-screen bg-white shadow-2xl relative flex flex-col overflow-x-hidden">
          <Routes>
            <Route path="/"               element={<SplashScreen />} />
            <Route path="/onboarding"     element={<OnboardingPage />} />
            <Route path="/login"          element={<PublicRoute><LoginPage /></PublicRoute>} />
            <Route path="/signup"         element={<PublicRoute><SignupPage /></PublicRoute>} />
            <Route path="/verify-email"   element={<VerifyEmailPage />} />
            <Route path="/profile-setup"  element={<PrivateRoute><ProfileSetupPage /></PrivateRoute>} />
            <Route path="/finding-nearby" element={<PrivateRoute><FindingNearbyPage /></PrivateRoute>} />
            <Route path="/edit-profile"   element={<PrivateRoute><EditProfilePage /></PrivateRoute>} />
            <Route path="/search"         element={<PrivateRoute><SearchPage /></PrivateRoute>} />
            <Route path="/profile/view/:userId" element={<PrivateRoute><ViewProfilePage /></PrivateRoute>} />

            {/* Chat room — full screen, no bottom tab bar */}
            <Route path="/chat/:conversationId" element={<PrivateRoute><ChatRoomPage /></PrivateRoute>} />

            {/* Main tabs with bottom nav */}
            <Route element={<MainRoute><MainLayout topBarProps={false} /></MainRoute>}>
              <Route path="/main/home"    element={<HomePage />} />
              <Route path="/main/matches" element={<MatchesPage />} />
              <Route path="/main/chats"   element={<ChatsPage />} />
              <Route path="/main/profile" element={<ProfilePage />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  )
}

export default App
