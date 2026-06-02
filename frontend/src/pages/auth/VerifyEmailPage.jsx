import React, { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { HiMail } from 'react-icons/hi'
import { toast } from 'react-toastify'

import BackButton from '../../components/common/BackButton'
import Button from '../../components/common/Button'
import { useAuthStore } from '../../store/authStore'

const VerifyEmailPage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { resendVerification } = useAuthStore()

  const email = location.state?.email || ''
  const [resending, setResending] = useState(false)
  const [resent, setResent] = useState(false)

  // Mask the email for display: and*****ley@yourdomain.com
  const maskEmail = (email) => {
    if (!email) return 'your email address'
    const [local, domain] = email.split('@')
    if (!domain) return email
    const masked =
      local.length <= 3
        ? local[0] + '*'.repeat(local.length - 1)
        : local.slice(0, 3) + '*'.repeat(Math.max(local.length - 4, 4)) + local.slice(-1)
    return `${masked}@${domain}`
  }

  const handleResend = async () => {
    if (resent) return
    setResending(true)
    const result = await resendVerification(email)
    setResending(false)
    if (result.success) {
      setResent(true)
      toast.success('Verification email resent!')
      setTimeout(() => setResent(false), 30000)
    } else {
      toast.error(result.message || 'Failed to resend email')
    }
  }

  const handleVerified = () => {
    navigate('/login', { replace: true })
  }

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Back button */}
      <div className="px-4 pt-12 pb-2">
        <BackButton onClick={() => navigate('/signup')} />
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-10">
        {/* Email icon */}
        <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center mb-8 animate-bounce-gentle">
          <HiMail className="text-4xl text-gray-700" />
        </div>

        {/* Text */}
        <h1 className="text-2xl font-extrabold text-gray-900 mb-4 text-center">
          Check Your Email
        </h1>
        <p className="text-sm text-gray-500 text-center leading-relaxed max-w-xs">
          We have sent an email to{' '}
          <span className="font-semibold text-gray-700">{maskEmail(email)}</span>.{' '}
          Click the link inside to get started.
        </p>

        {/* Resend */}
        <button
          type="button"
          onClick={handleResend}
          disabled={resending || resent}
          className={`mt-6 text-sm font-semibold transition-colors ${
            resent
              ? 'text-green-600 cursor-default'
              : 'text-primary-600 hover:text-primary-700 active:opacity-70'
          } disabled:opacity-60`}
        >
          {resending ? 'Sending...' : resent ? '✓ Email sent!' : 'Resend email'}
        </button>
      </div>

      {/* Bottom button */}
      <div className="px-6 pb-10">
        <Button variant="outline" onClick={handleVerified}>
          I've verified my email
        </Button>
      </div>
    </div>
  )
}

export default VerifyEmailPage
