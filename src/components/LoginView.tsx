import { useState } from 'react'
import { CoinIcon } from './Icons'

interface LoginViewProps {
  currentGoldGrams: number
  onLogin: (role: 'user' | 'admin') => void
}

export function LoginView({ currentGoldGrams, onLogin }: LoginViewProps) {
  const [role, setRole] = useState<'user' | 'admin'>('user')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [hint, setHint] = useState('')

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    if (!email.trim() || !password.trim()) {
      setError('Enter both email and password, or use Continue with Google.')
      return
    }
    setError('')
    onLogin(role)
  }

  const handleRoleChange = (nextRole: 'user' | 'admin') => {
    setRole(nextRole)
    setError('')
    if (hint) {
      setEmail(nextRole === 'admin' ? 'admin@ran.app' : 'aisha@ran.app')
    }
  }

  const handleForgotPassword = () => {
    setError('')
    setEmail(role === 'admin' ? 'admin@ran.app' : 'aisha@ran.app')
    setPassword('demo1234')
    setHint('Demo credentials filled — click Sign in or use Continue with Google.')
  }

  return (
    <main className="login-shell">
      <section className="login-brand-panel">
        <div className="login-brand">
          <span className="brand-mark"><CoinIcon /></span>
          <b>Ran</b>
        </div>
        <div className="login-brand-copy">
          <p>MICRO-GOLD PLATFORM</p>
          <h1>
            Build your gold future,
            <br />
            one gram at a time.
          </h1>
          <div className="login-glow">
            <span>{currentGoldGrams.toFixed(4)}g</span>
            <small>Secure digital gold wallet</small>
          </div>
        </div>
      </section>
      <section className="login-form-panel">
        <form className="login-card" onSubmit={handleSubmit}>
          <p className="eyebrow">WELCOME BACK</p>
          <h2>Sign in to Ran</h2>
          <div className="login-roles">
            <button
              type="button"
              className={role === 'user' ? 'active' : ''}
              onClick={() => handleRoleChange('user')}
            >
              User
            </button>
            <button
              type="button"
              className={role === 'admin' ? 'active' : ''}
              onClick={() => handleRoleChange('admin')}
            >
              Admin
            </button>
          </div>
          <label>
            Email address
            <input
              type="email"
              value={email}
              onChange={event => setEmail(event.target.value)}
              placeholder={role === 'admin' ? 'admin@ran.app' : 'aisha@ran.app'}
            />
          </label>
          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={event => setPassword(event.target.value)}
              placeholder="Enter any password for demo"
            />
          </label>
          {error && (
            <p className="login-error" role="alert">
              {error}
            </p>
          )}
          {hint && (
            <p className="demo-hint" role="status">
              {hint}
            </p>
          )}
          <button className="login-submit" type="submit">
            Sign in as {role === 'admin' ? 'Admin' : 'User'} <span>→</span>
          </button>
          <div className="login-divider">
            <span>or</span>
          </div>
          <button type="button" className="google-signin" onClick={() => onLogin(role)}>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path
                fill="#4285F4"
                d="M21.6 12.23c0-.71-.06-1.4-.18-2.06H12v3.89h5.38a4.6 4.6 0 0 1-2 3.02v2.52h3.24c1.89-1.74 2.98-4.31 2.98-7.37Z"
              />
              <path
                fill="#34A853"
                d="M12 22c2.7 0 4.97-.9 6.62-2.4l-3.24-2.52c-.9.6-2.05.96-3.38.96-2.61 0-4.82-1.76-5.61-4.13H3.04v2.6A10 10 0 0 0 12 22Z"
              />
              <path
                fill="#FBBC05"
                d="M6.39 13.91A6 6 0 0 1 6.07 12c0-.66.11-1.3.32-1.91v-2.6H3.04A10 10 0 0 0 2 12c0 1.61.39 3.14 1.04 4.51l3.35-2.6Z"
              />
              <path
                fill="#EA4335"
                d="M12 5.96c1.47 0 2.79.5 3.82 1.5l2.87-2.87A9.63 9.63 0 0 0 12 2a10 10 0 0 0-8.96 5.49l3.35 2.6A6 6 0 0 1 12 5.96Z"
              />
            </svg>
            Continue with Google
          </button>
          <button type="button" className="forgot-btn" onClick={handleForgotPassword}>
            Forgot password? Fill demo credentials
          </button>
        </form>
      </section>
    </main>
  )
}
