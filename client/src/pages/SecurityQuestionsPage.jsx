import { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { SECURITY_QUESTIONS } from '../lib/securityQuestions'

export default function SecurityQuestionsPage() {
  const { setSecurityQuestions, logout } = useAuth()
  const navigate = useNavigate()
  const [answers, setAnswers] = useState(['', '', '', '', ''])
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await setSecurityQuestions(answers)
      navigate('/dashboard')
    } catch (err) {
      setError(err?.response?.data?.error || 'Could not save your security questions. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="page-shell" style={{ maxWidth: 560, margin: '0 auto' }}>
      <motion.div
        className="clay-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <p className="eyebrow" style={{ color: 'var(--terracotta)' }}>One last step</p>
        <h1 className="page-title" style={{ marginTop: 8, fontSize: '1.6rem' }}>Set up account recovery</h1>
        <p className="page-subtitle" style={{ marginTop: 8 }}>
          Answer all five security questions now. If you ever forget your password, you'll be able to reset it
          by answering any three of them.
        </p>

        <form className="auth-form" onSubmit={handleSubmit} style={{ marginTop: 20, display: 'grid', gap: 14 }}>
          {SECURITY_QUESTIONS.map((question, index) => (
            <label className="field-label" key={question}>
              {question}
              <input
                className="field-input"
                value={answers[index]}
                onChange={(e) => {
                  const next = [...answers]
                  next[index] = e.target.value
                  setAnswers(next)
                }}
                placeholder="Your answer"
                required
              />
            </label>
          ))}

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
            {submitting ? 'Saving…' : 'Save & Continue'}
          </motion.button>
        </form>

        <p style={{ fontSize: '0.75rem', color: 'var(--muted-plum)', marginTop: 16, lineHeight: 1.6 }}>
          Not ready?{' '}
          <button
            type="button"
            onClick={logout}
            style={{ background: 'transparent', border: 'none', color: 'var(--terracotta)', fontWeight: 600, cursor: 'pointer', padding: 0 }}
          >
            Sign out
          </button>{' '}
          and finish this next time you log in.
        </p>
      </motion.div>
    </div>
  )
}
