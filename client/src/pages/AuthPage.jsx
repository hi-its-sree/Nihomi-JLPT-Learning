import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { SECURITY_QUESTIONS, RECOVERY_ANSWERS_REQUIRED } from '../lib/securityQuestions'

const ART_KANJI = ['日', '本', '語', '学', '習', '文', '字', '書']

export default function AuthPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [mode, setMode] = useState(searchParams.get('mode') === 'signup' ? 'signup' : 'login')
  const [form, setForm] = useState({ email: '', password: '', username: '' })
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // Forgot-password is its own 2-step wizard: pick+answer 3 of 5 questions,
  // then (once verified) choose a new password.
  const [forgotStep, setForgotStep] = useState('verify') // 'verify' | 'reset'
  const [selectedQuestions, setSelectedQuestions] = useState([])
  const [questionAnswers, setQuestionAnswers] = useState({})
  const [resetToken, setResetToken] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const navigate = useNavigate()
  const { login, signup, verifyRecoveryAnswers, resetPassword } = useAuth()

  useEffect(() => {
    const m = searchParams.get('mode')
    if (m === 'signup' || m === 'login') setMode(m)
  }, [searchParams])

  function field(key) {
    return (e) => setForm(prev => ({ ...prev, [key]: e.target.value }))
  }

  function toggleQuestion(index) {
    setSelectedQuestions(prev => {
      if (prev.includes(index)) {
        setQuestionAnswers(a => {
          const next = { ...a }
          delete next[index]
          return next
        })
        return prev.filter(i => i !== index)
      }
      if (prev.length >= RECOVERY_ANSWERS_REQUIRED) return prev
      return [...prev, index]
    })
  }

  async function handleVerifySubmit() {
    if (selectedQuestions.length !== RECOVERY_ANSWERS_REQUIRED) {
      setError(`Please select exactly ${RECOVERY_ANSWERS_REQUIRED} of the 5 security questions.`)
      return
    }
    if (selectedQuestions.some(i => !(questionAnswers[i] || '').trim())) {
      setError('Please answer all of your selected questions.')
      return
    }

    setSubmitting(true)
    try {
      const answers = SECURITY_QUESTIONS.map((_, i) => (selectedQuestions.includes(i) ? questionAnswers[i] : ''))
      const { resetToken: token } = await verifyRecoveryAnswers(form.email, answers)
      setResetToken(token)
      setForgotStep('reset')
    } catch (err) {
      setError(err?.response?.data?.error || 'We could not verify your answers. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleResetSubmit() {
    if (form.password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setSubmitting(true)
    try {
      await resetPassword(resetToken, form.password)
      switchMode('login')
      setNotice('Password reset successfully. Please sign in with your new password.')
    } catch (err) {
      setError(err?.response?.data?.error || 'We could not reset your password. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setNotice('')

    if (mode === 'forgot') {
      if (forgotStep === 'verify') await handleVerifySubmit()
      else await handleResetSubmit()
      return
    }

    setSubmitting(true)
    try {
      if (mode === 'login') {
        await login(form.email, form.password)
        navigate('/dashboard')
      } else if (mode === 'signup') {
        await signup(form.email, form.password, form.username)
        navigate('/security-questions')
      }
    } catch (err) {
      setError(err?.response?.data?.error || (mode === 'login'
        ? 'Invalid credentials. Please check your email and password.'
        : 'Could not create account. Please try again.'))
    } finally {
      setSubmitting(false)
    }
  }

  function switchMode(next) {
    setMode(next)
    setSearchParams({ mode: next === 'login' ? 'login' : next })
    setError('')
    setNotice('')
    setForm({ email: '', password: '', username: '' })
    setForgotStep('verify')
    setSelectedQuestions([])
    setQuestionAnswers({})
    setResetToken('')
    setConfirmPassword('')
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
            key={mode === 'forgot' ? `forgot-${forgotStep}` : mode}
            className="auth-card"
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={{ duration: 0.35 }}
          >
            <Link to="/" className="auth-back-link">← Back to home</Link>

            <div>
              <p className="eyebrow" style={{ color: 'var(--terracotta)' }}>
                {mode === 'login' ? 'Welcome back' : mode === 'forgot' ? 'Recover your account' : 'Start learning'}
              </p>
              <h2 className="auth-card-title" style={{ marginTop: 8 }}>
                {mode === 'login'
                  ? 'Sign in to continue'
                  : mode === 'forgot'
                    ? (forgotStep === 'verify' ? 'Verify your identity' : 'Choose a new password')
                    : 'Create your account'}
              </h2>
              <p className="auth-card-sub" style={{ marginTop: 6 }}>
                {mode === 'login'
                  ? 'Resume your study streak and pick up where you left off.'
                  : mode === 'forgot'
                    ? (forgotStep === 'verify'
                        ? `Step 1 of 2 — select and answer ${RECOVERY_ANSWERS_REQUIRED} of your 5 security questions.`
                        : 'Step 2 of 2 — your identity is verified. Set a new password below.')
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

              {mode === 'forgot' && forgotStep === 'verify' && (
                <>
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

                  <div style={{ display: 'grid', gap: 10 }}>
                    <p style={{ fontSize: '0.78rem', color: 'var(--muted-plum)', margin: 0 }}>
                      Select {RECOVERY_ANSWERS_REQUIRED} of these 5 questions ({selectedQuestions.length}/{RECOVERY_ANSWERS_REQUIRED} selected), then answer them.
                    </p>
                    {SECURITY_QUESTIONS.map((question, index) => {
                      const isSelected = selectedQuestions.includes(index)
                      const isDisabled = !isSelected && selectedQuestions.length >= RECOVERY_ANSWERS_REQUIRED
                      return (
                        <div key={question}>
                          <label
                            style={{
                              display: 'flex', alignItems: 'center', gap: 8, cursor: isDisabled ? 'not-allowed' : 'pointer',
                              opacity: isDisabled ? 0.45 : 1, fontSize: '0.85rem', fontWeight: 600, color: 'var(--dark-ink)',
                            }}
                          >
                            <input
                              type="checkbox"
                              checked={isSelected}
                              disabled={isDisabled}
                              onChange={() => toggleQuestion(index)}
                            />
                            {question}
                          </label>
                          {isSelected && (
                            <input
                              className="field-input"
                              style={{ marginTop: 6 }}
                              value={questionAnswers[index] || ''}
                              onChange={(e) => setQuestionAnswers(prev => ({ ...prev, [index]: e.target.value }))}
                              placeholder="Your answer"
                              required
                            />
                          )}
                        </div>
                      )
                    })}
                  </div>
                </>
              )}

              {mode === 'forgot' && forgotStep === 'reset' && (
                <>
                  <label className="field-label">
                    New password
                    <input
                      className="field-input"
                      type="password"
                      value={form.password}
                      onChange={field('password')}
                      placeholder="Choose a new password"
                      required
                      minLength={8}
                      autoComplete="new-password"
                    />
                  </label>
                  <label className="field-label">
                    Confirm new password
                    <input
                      className="field-input"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter your new password"
                      required
                      minLength={8}
                      autoComplete="new-password"
                    />
                  </label>
                </>
              )}

              {(mode === 'login' || mode === 'signup') && (
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
              )}

              {(mode === 'login' || mode === 'signup') && (
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
              )}

              {mode === 'login' && (
                <div style={{ textAlign: 'right' }}>
                  <button
                    type="button"
                    onClick={() => switchMode('forgot')}
                    style={{ fontSize: '0.82rem', color: 'var(--terracotta)', cursor: 'pointer', fontWeight: 600, background: 'transparent', border: 'none', padding: 0 }}
                  >
                    Forgot password?
                  </button>
                </div>
              )}

              {notice && mode === 'login' && (
                <motion.p
                  className="notice notice-green"
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{ borderRadius: 12 }}
                >
                  {notice}
                </motion.p>
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
                  ? (mode === 'login'
                      ? 'Signing in…'
                      : mode === 'forgot'
                        ? (forgotStep === 'verify' ? 'Verifying…' : 'Updating password…')
                        : 'Creating account…')
                  : (mode === 'login'
                      ? 'Sign In'
                      : mode === 'forgot'
                        ? (forgotStep === 'verify' ? 'Verify Answers' : 'Reset Password')
                        : 'Create Account')
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
              ) : mode === 'forgot' ? (
                <>
                  <span>Remembered your password?</span>
                  <button type="button" onClick={() => switchMode('login')}>
                    Sign in →
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
