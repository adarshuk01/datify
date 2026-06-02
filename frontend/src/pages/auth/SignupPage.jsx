import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { MdEmail } from 'react-icons/md'
import { toast } from 'react-toastify'

import BackButton from '../../components/common/BackButton'
import Button from '../../components/common/Button'
import Input from '../../components/common/Input'
import Checkbox from '../../components/common/Checkbox'
import { useAuthStore } from '../../store/authStore'
import { validateEmail, validatePassword } from '../../utils/validators'

const SignupPage = () => {
  const navigate = useNavigate()
  const { signup, isLoading } = useAuthStore()

  const [form, setForm] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [agreedToPolicy, setAgreedToPolicy] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }))
  }

  const validate = () => {
    const newErrors = {}
    if (!validateEmail(form.email)) newErrors.email = 'Please enter a valid email'
    if (!validatePassword(form.password)) newErrors.password = 'Password must be at least 6 characters'
    if (!agreedToPolicy) newErrors.policy = 'You must agree to the Privacy Policy'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSignup = async () => {
    if (!validate()) return

    const result = await signup(form.email, form.password)
    if (result.success) {
      navigate('/verify-email', {
        state: { email: form.email },
        replace: true,
      })
    } else {
      toast.error(result.message || 'Signup failed. Please try again.')
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Back button */}
      <div className="px-4 pt-12 pb-2">
        <BackButton onClick={() => navigate('/onboarding')} />
      </div>

      {/* Content */}
      <div className="flex-1 px-6 pt-4 pb-10 flex flex-col">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-extrabold text-gray-900 mb-1 flex items-center gap-2">
            Create an account <span className="text-2xl">🧑‍💻</span>
          </h1>
          <p className="text-sm text-gray-500">
            Create your account in seconds. We'll help you find your perfect match.
          </p>
        </div>

        {/* Form */}
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
            autoComplete="new-password"
          />

          {/* Privacy policy checkbox */}
          <div>
            <Checkbox
              id="privacy-policy"
              checked={agreedToPolicy}
              onChange={setAgreedToPolicy}
              label="I agree to Datify "
              labelAction={{
                text: 'Privacy Policy.',
                onClick: () => window.open('/privacy', '_blank'),
              }}
            />
            {errors.policy && (
              <p className="mt-1.5 text-xs text-red-500 font-medium">⚠ {errors.policy}</p>
            )}
          </div>
        </div>

        {/* Divider */}
        <div className="my-8 border-t border-gray-100" />

        {/* Sign in link */}
        <p className="text-center text-sm text-gray-600 mb-8">
          Already have an account?{' '}
          <Link
            to="/login"
            className="font-semibold text-primary-600 hover:text-primary-700 transition-colors"
          >
            Sign in
          </Link>
        </p>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Sign up button */}
        <Button
          onClick={handleSignup}
          loading={isLoading}
          disabled={isLoading}
          variant="primary"
        >
          Sign up
        </Button>
      </div>
    </div>
  )
}

export default SignupPage
