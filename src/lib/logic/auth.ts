export const MIN_PASSWORD = 8

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

export interface CredentialErrors {
  email?: string
  password?: string
}

export function validateCredentials(email: string, password: string, mode: 'login' | 'signup'): CredentialErrors {
  const errors: CredentialErrors = {}
  if (!EMAIL.test(email.trim())) errors.email = 'Enter a valid email address.'
  if (!password) errors.password = 'Enter your password.'
  else if (mode === 'signup' && password.length < MIN_PASSWORD) errors.password = `Use at least ${MIN_PASSWORD} characters.`
  return errors
}

/** Turn Supabase auth errors into short, human copy. */
export function friendlyAuthError(message: string): string {
  const m = message.toLowerCase()
  if (m.includes('invalid login credentials')) return 'Email or password is incorrect.'
  if (m.includes('email not confirmed')) return 'Confirm your email first. Check your inbox for the link we sent.'
  if (m.includes('already registered') || m.includes('already been registered')) return 'An account with this email already exists. Try logging in.'
  if (m.includes('rate limit') || m.includes('too many')) return 'Too many attempts. Wait a minute and try again.'
  if (m.includes('password') && m.includes('characters')) return `Use at least ${MIN_PASSWORD} characters for your password.`
  if (m.includes('failed to fetch') || m.includes('network')) return 'Couldn’t reach the server. Check your connection.'
  return message
}
