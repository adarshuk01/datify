import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import FloatingHearts from '../components/common/FloatingHearts'
import Logo from '../components/common/Logo'
import Spinner from '../components/common/Spinner'
import { useAuthStore } from '../store/authStore'

const SplashScreen = () => {
  const navigate = useNavigate()
  const { isAuthenticated, user } = useAuthStore()

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isAuthenticated) {
        navigate('/onboarding', { replace: true })
      } else if (!user?.profileSetupComplete) {
        navigate('/profile-setup', { replace: true })
      } else {
        navigate('/main/home', { replace: true })
      }
    }, 2200)
    return () => clearTimeout(timer)
  }, [navigate, isAuthenticated, user])

  return (
    <div
      className="relative flex flex-col items-center justify-center min-h-screen overflow-hidden"
      style={{
        background: 'linear-gradient(160deg, #7C3AED 0%, #6D28D9 40%, #9333EA 100%)',
      }}
    >
      <FloatingHearts count={14} light />
      <div className="flex flex-col items-center gap-4 animate-fade-in relative z-10">
        <Logo size="lg" showText light />
      </div>
      <div className="absolute bottom-20 flex items-center justify-center">
        <Spinner size="lg" color="white" />
      </div>
    </div>
  )
}

export default SplashScreen
