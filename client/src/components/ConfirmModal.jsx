import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createPortal } from 'react-dom'

// In-app replacement for window.confirm() — matches the rest of the app's
// clay-card visual language instead of a native browser dialog.
export default function ConfirmModal({ open, title, message, confirmLabel = 'Delete', danger = true, onConfirm, onClose }) {
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (open) setError('')
  }, [open])

  useEffect(() => {
    if (!open) return
    function handleKeyDown(e) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [open, onClose])

  async function handleConfirm() {
    if (submitting) return
    setSubmitting(true)
    setError('')
    try {
      await onConfirm()
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
            <h2 className="auth-card-title" style={{ fontSize: '1.15rem' }}>{title}</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--muted-plum)', marginTop: 8, lineHeight: 1.5 }}>{message}</p>

            {error && (
              <motion.p className="auth-error" initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} style={{ marginTop: 10 }}>
                {error}
              </motion.p>
            )}

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 18 }}>
              <button type="button" className="ghost-btn btn-sm" onClick={onClose}>Cancel</button>
              <button
                type="button"
                className="primary-btn btn-sm"
                style={danger ? { background: '#be123c' } : undefined}
                onClick={handleConfirm}
                disabled={submitting}
              >
                {submitting ? 'Working…' : confirmLabel}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  )
}
