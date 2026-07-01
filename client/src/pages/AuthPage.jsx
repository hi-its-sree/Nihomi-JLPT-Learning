import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const ART_KANJI = ['日', '本', '語', '学', '習', '文', '字', '書']

export default function AuthPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [mode, setMode] = useState(searchParams.get('mode') === 'signup' ? 'signup' : 'login')
  const [form, setForm] = useState({ email: '', password: '', username: '' })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const navigate = useNavigate()
  const { login, signup } = useAuth()

  useEffect(() => {
    const m = searchParams.get('mode')
    if (m === 'signup' || m === 'login') setMode(m)
  }, [searchParams])

  function field(key) {
    return (e) => setForm(prev => ({ ...prev, [key]: e.target.value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      if (mode === 'login') {
        await login(form.email, form.password)
      } else {
        await signup(form.email, form.password, form.username)
      }
      navigate('/dashboard')
    } catch {
      setError(mode === 'login'
        ? 'Invalid credentials. Please check your email and password.'
        : 'Could not create account. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  function switchMode(next) {
    setMode(next)
    setSearchParams({ mode: next })
    setError('')
    setForm({ email: '', password: '', username: '' })
  }

  return (
    <div className="auth-shell">

      {/* ── Left: dark art panel ─────────────── */}
      <div className="auth-art">
        {/* Decorative kanji bg */}
        {ART_KANJI.map((k, i) => (
          <motion.span
            key={k}
            className="auth-art-kanji"
            style={{
              top:  `${10 + (i * 11) % 80}%`,
              left: `${5 + (i * 13) % 80}%`,
              fontSize: `${5 + (i % 3) * 3}rem`,
            }}
            animate={{ opacity: [0.06, 0.18, 0.06], y: [0, -12, 0] }}
            transition={{ duration: 5 + i, repeat: Infinity, delay: i * 0.4 }}
          >
            {k}
          </motion.span>
        ))}

        <motion.div
          className="auth-art-logo"
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          語
        </motion.div>

        <motion.h2
          className="auth-art-title"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          Your Japanese
          <br />journey awaits.
        </motion.h2>

        <motion.p
          className="auth-art-subtitle"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          From first hiragana to advanced N1 kanji — structured, beautiful, and built around your pace.
        </motion.p>

        {/* Animated ink stroke line */}
        <motion.div
          style={{
            position: 'absolute',
            bottom: 48,
            left: 40,
            right: 40,
            height: 2,
            background: 'linear-gradient(90deg, transparent, rgba(201,168,76,0.5), transparent)',
            borderRadius: 999,
          }}
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 0.8, duration: 1.2 }}
        />
      </div>

      {/* ── Right: form ──────────────────────── */}
      <div className="auth-form-side">
        <AnimatePresence mode="wait">
          <motion.div
            key={mode}
            className="auth-card"
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={{ duration: 0.35 }}
          >
            <Link to="/" className="auth-back-link">← Back to home</Link>

            <div>
              <p className="eyebrow" style={{ color: 'var(--terracotta)' }}>
                {mode === 'login' ? 'Welcome back' : 'Start learning'}
              </p>
              <h2 className="auth-card-title" style={{ marginTop: 8 }}>
                {mode === 'login' ? 'Sign in to continue' : 'Create your account'}
              </h2>
              <p className="auth-card-sub" style={{ marginTop: 6 }}>
                {mode === 'login'
                  ? 'Resume your study streak and pick up where you left off.'
                  : 'Join thousands of learners on their path to JLPT success.'}
              </p>
            </div>

            <form className="auth-form" onSubmit={handleSubmit}>
              {mode === 'signup' && (
                <label className="field-label">
                  Username
                  <input
                    className="field-input"
                    value={form.username}
                    onChange={field('username')}
                    placeholder="e.g. sakura_learner"
                    required
                    autoComplete="username"
                  />
                </label>
              )}

              <label className="field-label">
                Email address
                <input
                  className="field-input"
                  type="email"
                  value={form.email}
                  onChange={field('email')}
                  placeholder="you@example.com"
                  required
                  autoComplete="email"
                />
              </label>

              <label className="field-label">
                Password
                <input
                  className="field-input"
                  type="password"
                  value={form.password}
                  onChange={field('password')}
                  placeholder={mode === 'signup' ? 'At least 8 characters' : '••••••••'}
                  required
                  minLength={mode === 'signup' ? 8 : undefined}
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                />
              </label>

              {mode === 'login' && (
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '0.82rem', color: 'var(--terracotta)', cursor: 'pointer', fontWeight: 600 }}>
                    Forgot password?
                  </span>
                </div>
              )}

              {error && (
                <motion.p
                  className="auth-error"
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  {error}
                </motion.p>
              )}

              <motion.button
                type="submit"
                className="primary-btn btn-wide"
                disabled={submitting}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                style={{ marginTop: 4 }}
              >
                {submitting
                  ? (mode === 'login' ? 'Signing in…' : 'Creating account…')
                  : (mode === 'login' ? 'Sign In' : 'Create Account')
                }
              </motion.button>
            </form>

            <hr className="divider" />

            <div className="auth-switcher">
              {mode === 'login' ? (
                <>
                  <span>New to JLPT Learning?</span>
                  <button type="button" onClick={() => switchMode('signup')}>
                    Create an account →
                  </button>
                </>
              ) : (
                <>
                  <span>Already have an account?</span>
                  <button type="button" onClick={() => switchMode('login')}>
                    Sign in →
                  </button>
                </>
              )}
            </div>

            <p style={{ fontSize: '0.75rem', color: 'var(--muted-plum)', lineHeight: 1.6 }}>
              By continuing you agree to our Terms of Service and Privacy Policy.
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

    </div>
  )
}
