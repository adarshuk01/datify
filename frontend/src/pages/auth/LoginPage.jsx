import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { MdEmail } from 'react-icons/md'
import { toast } from 'react-toastify'

import BackButton from '../../components/common/BackButton'
import Button from '../../components/common/Button'
import Input from '../../components/common/Input'
import Checkbox from '../../components/common/Checkbox'
import LoginSuccessModal from '../../components/auth/LoginSuccessModal'
import { useAuthStore } from '../../store/authStore'
import { validateEmail, validatePassword } from '../../utils/validators'

const LoginPage = () => {
  const navigate = useNavigate()
  const { login, isLoading } = useAuthStore()

  const [form, setForm] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [rememberMe, setRememberMe] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }))
  }

  const validate = () => {
    const newErrors = {}
    if (!validateEmail(form.email)) newErrors.email = 'Please enter a valid email'
    if (!validatePassword(form.password)) newErrors.password = 'Password must be at least 6 characters'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleLogin = async () => {
    if (!validate()) return
    const result = await login(form.email, form.password)
    if (result.success) {
      setShowSuccess(true)
      // After 2s navigate based on whether profile is complete
      setTimeout(() => {
        const user = useAuthStore.getState().user
        if (!user?.profileSetupComplete) {
          navigate('/profile-setup', { replace: true })
        } else {
          navigate('/main/home', { replace: true })
        }
      }, 2000)
    } else {
      toast.error(result.message || 'Login failed. Please try again.')
    }
  }

  return (
    <div className="relative flex flex-col min-h-screen bg-white">
      <div className="px-4 pt-12 pb-2">
        <BackButton onClick={() => navigate('/onboarding')} />
      </div>

      <div className="flex-1 px-6 pt-4 pb-10 flex flex-col">
        <div className="mb-8">
          <h1 className="text-2xl font-extrabold text-gray-900 mb-1 flex items-center gap-2">
            Welcome back <span className="text-2xl">👋</span>
          </h1>
          <p className="text-sm text-gray-500">Please enter your email & password to sign in.</p>
        </div>

        <div className="flex flex-col gap-5">
          <Input
            label="Email"
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            icon={MdEmail}
            error={errors.email}
            autoComplete="email"
          />
          <Input
            label="Password"
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            error={errors.password}
            autoComplete="current-password"
          />
          <div className="flex items-center justify-between">
            <Checkbox
              id="remember-me"
              checked={rememberMe}
              onChange={setRememberMe}
              label="Remember me"
            />
            <Link to="/forgot-password" className="text-sm font-semibold text-primary-600 hover:text-primary-700 transition-colors">
              Forgot password?
            </Link>
          </div>
        </div>

        <div className="my-8 border-t border-gray-100" />

        <p className="text-center text-sm text-gray-600 mb-8">
          Don't have an account?{' '}
          <Link to="/signup" className="font-semibold text-primary-600 hover:text-primary-700 transition-colors">
            Sign up
          </Link>
        </p>

        <div className="flex-1" />

        <Button onClick={handleLogin} loading={isLoading} disabled={isLoading} variant="primary">
          Log in
        </Button>
      </div>

      <LoginSuccessModal isOpen={showSuccess} />
    </div>
  )
}

export default LoginPage
