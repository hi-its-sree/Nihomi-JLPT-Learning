import { useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

const CATEGORIES = ['General question', 'Bug report', 'Feature request', 'Content error', 'Account issue']

export default function ContactPage() {
  const [form, setForm]     = useState({ name: '', email: '', category: 'General question', message: '' })
  const [sent, setSent]     = useState(false)
  const [sending, setSending] = useState(false)

  function f(key) {
    return e => setForm(prev => ({ ...prev, [key]: e.target.value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSending(true)
    await new Promise(r => setTimeout(r, 1200))
    setSent(true)
    setSending(false)
  }

  if (sent) {
    return (
      <div className="page-shell">
        <motion.div
          className="clay-card clay-card--lg"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          style={{ textAlign: 'center', maxWidth: 520, margin: '0 auto' }}
        >
          <div style={{ fontSize: '3rem', marginBottom: 12 }}>✉️</div>
          <h2 className="section-title" style={{ fontSize: '1.4rem' }}>Message Sent!</h2>
          <p style={{ color: 'var(--muted-plum)', marginTop: 8, lineHeight: 1.6 }}>
            Thank you for reaching out. We'll get back to you within 1–2 business days.
          </p>
          <div style={{ marginTop: 20, display: 'flex', gap: 10, justifyContent: 'center' }}>
            <Link to="/dashboard" className="primary-btn">Back to Dashboard</Link>
            <button className="ghost-btn" onClick={() => setSent(false)}>Send another</button>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="page-shell">

      <motion.div
        className="clay-card clay-card--lg"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ position: 'relative', overflow: 'hidden' }}
      >
        <p className="eyebrow">Support &amp; Feedback</p>
        <h1 className="page-title" style={{ marginTop: 8 }}>Get in Touch</h1>
        <p className="page-subtitle" style={{ marginTop: 10 }}>
          Questions, bug reports, content feedback, or feature ideas — we read every message and respond within 1–2 business days.
        </p>
        <span style={{ position: 'absolute', right: 24, top: '50%', transform: 'translateY(-50%)', fontSize: '7rem', fontWeight: 900, color: 'rgba(201,122,74,0.05)', pointerEvents: 'none' }}>✉</span>
      </motion.div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, alignItems: 'start', flexWrap: 'wrap' }}>

        {/* Form */}
        <motion.div className="clay-card" initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <label className="field-label">
                Name
                <input className="field-input" value={form.name} onChange={f('name')} placeholder="Your name" required />
              </label>
              <label className="field-label">
                Email
                <input className="field-input" type="email" value={form.email} onChange={f('email')} placeholder="you@example.com" required />
              </label>
            </div>

            <label className="field-label">
              Category
              <select className="field-select" value={form.category} onChange={f('category')}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </label>

            <label className="field-label">
              Message
              <textarea
                className="field-input"
                rows={5}
                value={form.message}
                onChange={f('message')}
                placeholder="Describe your question or feedback…"
                required
                style={{ resize: 'vertical' }}
              />
            </label>

            <motion.button
              type="submit"
              className="primary-btn"
              disabled={sending}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {sending ? 'Sending…' : 'Send message →'}
            </motion.button>
          </form>
        </motion.div>

        {/* Contact info */}
        <motion.div
          style={{ display: 'flex', flexDirection: 'column', gap: 14 }}
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          {[
            { icon: '✉', title: 'Email Support', desc: 'hello@jlptlearning.com', sub: 'Response within 1–2 business days' },
            { icon: '💬', title: 'Community',     desc: 'Join our Discord server', sub: 'Connect with other JLPT learners' },
            { icon: '📚', title: 'Help Center',   desc: 'docs.jlptlearning.com', sub: 'FAQs, guides, and tutorials' },
          ].map(c => (
            <div key={c.title} className="content-card">
              <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                <div style={{ fontSize: '1.6rem', width: 44, height: 44, borderRadius: 14, background: 'rgba(201,122,74,0.1)', display: 'grid', placeItems: 'center' }}>{c.icon}</div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--dark-ink)' }}>{c.title}</div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--terracotta)', fontWeight: 700, marginTop: 2 }}>{c.desc}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--muted-plum)', marginTop: 1 }}>{c.sub}</div>
                </div>
              </div>
            </div>
          ))}

          <div className="notice notice-gold">
            <strong>Content error?</strong> — If you spot an incorrect reading, translation, or stroke order, please select "Content error" in the category field. Your feedback directly improves the platform.
          </div>
        </motion.div>

      </div>

    </div>
  )
}
