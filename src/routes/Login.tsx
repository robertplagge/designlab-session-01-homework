import { Check, Eye, EyeOff } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Link, Navigate, useNavigate } from 'react-router'
import { useAuth } from '../lib/authContext'
import { MIN_PASSWORD, validateCredentials, type CredentialErrors } from '../lib/logic/auth'

type Mode = 'login' | 'signup'

const input = 'min-h-12 w-full rounded-xl border bg-surface px-3 text-base placeholder:text-muted'

export default function Login() {
  const { user, loading, configured, signIn, signUp } = useAuth()
  const navigate = useNavigate()
  const [mode, setMode] = useState<Mode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [show, setShow] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<CredentialErrors>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [confirmEmail, setConfirmEmail] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  if (!loading && user) return <Navigate to="/" replace />

  const switchMode = (m: Mode) => {
    setMode(m)
    setFieldErrors({})
    setFormError(null)
    setConfirmEmail(null)
  }

  async function submit(e: FormEvent) {
    e.preventDefault()
    const errors = validateCredentials(email, password, mode)
    setFieldErrors(errors)
    setFormError(null)
    if (errors.email || errors.password) return
    setBusy(true)
    const result = mode === 'login' ? await signIn(email, password) : await signUp(email, password)
    setBusy(false)
    if (result.error) return setFormError(result.error)
    if (result.needsConfirmation) return setConfirmEmail(email.trim())
    navigate('/', { replace: true })
  }

  return (
    <div className="mx-auto flex min-h-[calc(100dvh-4rem)] max-w-sm flex-col justify-center py-8">
      <div className="mb-8 flex flex-col items-center gap-3 text-center">
        <span className="grid h-14 w-14 place-items-center rounded-2xl bg-accent text-accent-ink" aria-hidden>
          <Check size={30} strokeWidth={3.5} />
        </span>
        <h1 className="text-3xl font-bold tracking-tight">Seen</h1>
        <p className="text-sm text-muted">One private log for everything you watch.</p>
      </div>

      {confirmEmail ? (
        <div role="status" className="anim-slide-up rounded-2xl border border-accent/40 bg-accent-soft p-5 text-center">
          <h2 className="text-lg font-semibold">Check your email</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            We sent a confirmation link to <span className="font-medium text-fg">{confirmEmail}</span>. Open it, then come back and log in.
          </p>
          <button type="button" onClick={() => switchMode('login')} className="mt-4 min-h-12 w-full rounded-xl bg-accent font-semibold text-accent-ink">
            Go to log in
          </button>
        </div>
      ) : (
        <>
          <div role="tablist" aria-label="Account" className="mb-5 grid grid-cols-2 rounded-xl bg-surface p-1">
            {(['login', 'signup'] as const).map((m) => (
              <button
                key={m}
                role="tab"
                type="button"
                aria-selected={mode === m}
                onClick={() => switchMode(m)}
                className={`min-h-11 rounded-lg text-sm font-semibold ${mode === m ? 'bg-surface-2 text-fg' : 'text-muted hover:text-fg'}`}
              >
                {m === 'login' ? 'Log in' : 'Create account'}
              </button>
            ))}
          </div>

          <form onSubmit={submit} noValidate className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <input
                id="email"
                type="email"
                inputMode="email"
                autoComplete="email"
                autoCapitalize="none"
                spellCheck={false}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                aria-invalid={!!fieldErrors.email}
                aria-describedby={fieldErrors.email ? 'email-error' : undefined}
                placeholder="you@example.com"
                className={`${input} ${fieldErrors.email ? 'border-danger' : 'border-line'}`}
              />
              {fieldErrors.email && (
                <p id="email-error" className="text-sm text-danger">
                  {fieldErrors.email}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="password" className="text-sm font-medium">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={show ? 'text' : 'password'}
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  aria-invalid={!!fieldErrors.password}
                  aria-describedby={fieldErrors.password ? 'password-error' : mode === 'signup' ? 'password-hint' : undefined}
                  className={`${input} pr-12 ${fieldErrors.password ? 'border-danger' : 'border-line'}`}
                />
                <button
                  type="button"
                  onClick={() => setShow((s) => !s)}
                  aria-label={show ? 'Hide password' : 'Show password'}
                  aria-pressed={show}
                  className="absolute right-0.5 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center text-muted hover:text-fg"
                >
                  {show ? <EyeOff size={18} aria-hidden /> : <Eye size={18} aria-hidden />}
                </button>
              </div>
              {fieldErrors.password ? (
                <p id="password-error" className="text-sm text-danger">
                  {fieldErrors.password}
                </p>
              ) : (
                mode === 'signup' && (
                  <p id="password-hint" className="text-xs text-muted">
                    At least {MIN_PASSWORD} characters.
                  </p>
                )
              )}
            </div>

            {formError && (
              <p role="alert" className="rounded-xl border border-danger/50 bg-surface px-3 py-2.5 text-sm text-danger">
                {formError}
              </p>
            )}
            {!configured && (
              <p role="status" className="rounded-xl border border-line bg-surface px-3 py-2.5 text-sm text-muted">
                Accounts aren’t connected yet (no Supabase key in <code>.env.local</code>). You can still use Seen without one.
              </p>
            )}

            <button type="submit" disabled={busy} className="min-h-12 rounded-xl bg-accent font-semibold text-accent-ink disabled:opacity-60">
              {busy ? 'Please wait…' : mode === 'login' ? 'Log in' : 'Create account'}
            </button>
          </form>
        </>
      )}

      <Link to="/" className="mt-6 flex min-h-11 items-center justify-center text-sm font-medium text-muted hover:text-fg">
        Continue without an account
      </Link>
    </div>
  )
}
