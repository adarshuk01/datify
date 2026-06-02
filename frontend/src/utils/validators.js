export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return re.test(String(email).toLowerCase())
}

export const validatePassword = (password) => {
  return password && password.length >= 6
}

export const maskEmail = (email) => {
  if (!email) return ''
  const [local, domain] = email.split('@')
  if (!domain) return email
  const masked =
    local.length <= 3
      ? local[0] + '*'.repeat(local.length - 1)
      : local.slice(0, 3) + '*'.repeat(Math.max(local.length - 4, 4)) + local.slice(-1)
  return `${masked}@${domain}`
}

export const formatError = (error) => {
  if (typeof error === 'string') return error
  return error?.message || 'An unexpected error occurred'
}
