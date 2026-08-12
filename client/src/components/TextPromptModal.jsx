import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createPortal } from 'react-dom'

// In-app replacement for window.prompt() — matches the rest of the app's
// clay-card / field-input visual language instead of a native browser dialog.
// Used for both "create a collection" and "rename a collection".
export default function TextPromptModal({
  open,
  eyebrow = 'Collections',
  title,
  subtitle,
  initialValue = '',
  fieldLabel = 'Collection name',
  submitLabel = 'Save',
  onSubmit,
  onClose,
}) {
  const [value, setValue] = useState(initialValue)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const inputRef = useRef(null)

  useEffect(() => {
    if (!open) return
    setValue(initialValue)
    setError('')
    const focusTimer = setTimeout(() => {
      inputRef.current?.focus()
      inputRef.current?.select()
    }, 50)
    return () => clearTimeout(focusTimer)
  }, [open, initialValue])

  useEffect(() => {
    if (!open) return
    function handleKeyDown(e) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [open, onClose])

  async function handleSubmit(e) {
    e.preventDefault()
    const trimmed = value.trim()
    if (!trimmed || submitting) return
    setSubmitting(true)
    setError('')
    try {
      await onSubmit(trimmed)
      onClose()
    } catch (err) {
      setError(err?.response?.data?.error || 'Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          onMouseDown={(e) => e.stopPropagation()}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(43,31,20,0.45)', zIndex: 2000,
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
          }}
        >
          <motion.div
            className="clay-card"
            initial={{ opacity: 0, scale: 0.94, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 10 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: 380, width: '100%' }}
          >
            <p className="eyebrow" style={{ color: 'var(--terracotta)' }}>{eyebrow}</p>
            <h2 className="auth-card-title" style={{ marginTop: 6, fontSize: '1.2rem' }}>{title}</h2>
            {subtitle && (
              <p style={{ fontSize: '0.82rem', color: 'var(--muted-plum)', marginTop: 6, lineHeight: 1.5 }}>{subtitle}</p>
            )}

            <form onSubmit={handleSubmit} style={{ marginTop: 16, display: 'grid', gap: 12 }}>
              <label className="field-label">
                {fieldLabel}
                <input
                  ref={inputRef}
                  className="field-input"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  placeholder="e.g. Trip Kanji, Hard Ones…"
                  maxLength={40}
                />
              </label>

              {error && (
                <motion.p className="auth-error" initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} style={{ margin: 0 }}>
                  {error}
                </motion.p>
              )}

              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 4 }}>
                <button type="button" className="ghost-btn btn-sm" onClick={onClose}>Cancel</button>
                <button type="submit" className="primary-btn btn-sm" disabled={!value.trim() || submitting}>
                  {submitting ? 'Saving…' : submitLabel}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  )
}
