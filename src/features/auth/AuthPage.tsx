import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
} from 'firebase/auth'
import { auth } from '@/config/firebase'
import { Input, Button } from '@/components/ui'

type Tab = 'login' | 'register'

function getAuthError(code: string): string {
  switch (code) {
    case 'auth/user-not-found':
    case 'auth/wrong-password':
      return 'Invalid email or password'
    case 'auth/email-already-in-use':
      return 'An account with this email already exists'
    case 'auth/weak-password':
      return 'Password must be at least 6 characters'
    case 'auth/invalid-email':
      return 'Invalid email address'
    default:
      return 'Something went wrong. Please try again.'
  }
}

export function AuthPage() {
  const navigate = useNavigate()
  const [tab, setTab] = useState<Tab>('login')

  // Login state
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [loginError, setLoginError] = useState<string | null>(null)
  const [loginSubmitting, setLoginSubmitting] = useState(false)

  // Register state
  const [displayName, setDisplayName] = useState('')
  const [artistName, setArtistName] = useState('')
  const [regEmail, setRegEmail] = useState('')
  const [regPassword, setRegPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [regError, setRegError] = useState<string | null>(null)
  const [regSubmitting, setRegSubmitting] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoginError(null)
    setLoginSubmitting(true)
    try {
      await signInWithEmailAndPassword(auth, loginEmail, loginPassword)
      navigate('/projects')
    } catch (err: unknown) {
      const code = (err as { code?: string }).code ?? ''
      setLoginError(getAuthError(code))
    } finally {
      setLoginSubmitting(false)
    }
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setRegError(null)

    if (regPassword !== confirmPassword) {
      setRegError('Passwords do not match')
      return
    }
    if (regPassword.length < 6) {
      setRegError('Password must be at least 6 characters')
      return
    }

    setRegSubmitting(true)
    try {
      const userCred = await createUserWithEmailAndPassword(auth, regEmail, regPassword)
      await updateProfile(userCred.user, { displayName })
      navigate('/projects')
    } catch (err: unknown) {
      const code = (err as { code?: string }).code ?? ''
      setRegError(getAuthError(code))
    } finally {
      setRegSubmitting(false)
    }
  }

  const tabStyle = (active: boolean): React.CSSProperties => ({
    padding: '8px 16px',
    background: 'transparent',
    border: 'none',
    borderBottom: active ? '2px solid var(--color-primary)' : '2px solid transparent',
    color: active ? 'var(--color-primary)' : 'var(--color-text-secondary)',
    fontFamily: 'var(--font-mono)',
    fontSize: '12px',
    fontWeight: 700,
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    cursor: 'pointer',
    borderRadius: 0,
    transition: 'color var(--transition-fast), border-color var(--transition-fast)',
  })

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--color-bg)',
        padding: '24px',
      }}
    >
      <div
        style={{
          width: '400px',
          border: '2px solid var(--color-border-strong)',
          borderRadius: 0,
          background: 'var(--color-surface)',
          padding: '40px',
        }}
      >
        {/* Logo */}
        <div
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '13px',
            fontWeight: 700,
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: 'var(--color-primary)',
            marginBottom: '8px',
          }}
        >
          ASPIRE AMS
        </div>

        {/* Title */}
        <h1
          style={{
            fontSize: '22px',
            fontWeight: 700,
            color: 'var(--color-text-primary)',
            margin: '0 0 24px 0',
            lineHeight: 1.2,
          }}
        >
          Artist Management System
        </h1>

        {/* Tabs */}
        <div
          style={{
            display: 'flex',
            borderBottom: '1px solid var(--color-border)',
            marginBottom: '28px',
          }}
        >
          <button style={tabStyle(tab === 'login')} onClick={() => setTab('login')}>
            Login
          </button>
          <button style={tabStyle(tab === 'register')} onClick={() => setTab('register')}>
            Register
          </button>
        </div>

        {/* Login Form */}
        {tab === 'login' && (
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <Input
              label="Email"
              type="email"
              value={loginEmail}
              onChange={(e) => setLoginEmail(e.target.value)}
              fullWidth
              required
              autoComplete="email"
            />
            <Input
              label="Password"
              type="password"
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
              fullWidth
              required
              autoComplete="current-password"
            />
            {loginError && (
              <p
                style={{
                  fontSize: '13px',
                  color: 'var(--color-danger)',
                  margin: 0,
                }}
                role="alert"
              >
                {loginError}
              </p>
            )}
            <Button
              type="submit"
              variant="primary"
              fullWidth
              loading={loginSubmitting}
              size="lg"
            >
              Sign In
            </Button>
          </form>
        )}

        {/* Register Form */}
        {tab === 'register' && (
          <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <Input
              label="Display Name"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              fullWidth
              required
              autoComplete="name"
            />
            <Input
              label="Artist Name"
              type="text"
              value={artistName}
              onChange={(e) => setArtistName(e.target.value)}
              fullWidth
              required
            />
            <Input
              label="Email"
              type="email"
              value={regEmail}
              onChange={(e) => setRegEmail(e.target.value)}
              fullWidth
              required
              autoComplete="email"
            />
            <Input
              label="Password"
              type="password"
              value={regPassword}
              onChange={(e) => setRegPassword(e.target.value)}
              fullWidth
              required
              minLength={6}
              autoComplete="new-password"
            />
            <Input
              label="Confirm Password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              fullWidth
              required
              autoComplete="new-password"
            />
            {regError && (
              <p
                style={{
                  fontSize: '13px',
                  color: 'var(--color-danger)',
                  margin: 0,
                }}
                role="alert"
              >
                {regError}
              </p>
            )}
            <Button
              type="submit"
              variant="primary"
              fullWidth
              loading={regSubmitting}
              size="lg"
            >
              Create Account
            </Button>
          </form>
        )}

        {/* Footer */}
        <p
          style={{
            fontSize: '11px',
            color: 'var(--color-text-secondary)',
            textAlign: 'center',
            marginTop: '24px',
            marginBottom: 0,
            letterSpacing: '0.05em',
          }}
        >
          Aspire Academy — Invite Only
        </p>
      </div>

      {/* DEV note */}
      {import.meta.env.DEV && (
        <p
          style={{
            fontSize: '11px',
            color: 'var(--color-text-secondary)',
            marginTop: '12px',
            fontFamily: 'var(--font-mono)',
          }}
        >
          DEV MODE — Auth bypassed in protected routes
        </p>
      )}
    </div>
  )
}
