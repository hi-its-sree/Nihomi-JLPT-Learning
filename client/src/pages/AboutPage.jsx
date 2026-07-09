import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

const PILLARS = [
  { icon: '⛩', title: 'Cultural Depth',       desc: 'Learn Japanese through the stories, art, and daily life that shape modern Japan — not just vocabulary lists.' },
  { icon: '🗺', title: 'Structured Path',       desc: 'A clear N5 → N1 curriculum aligned to official JLPT standards, with no gaps and no guesswork.' },
  { icon: '🃏', title: 'Spaced Repetition',    desc: 'SRS flashcard system that surfaces words and kanji at the optimal moment for long-term memory retention.' },
  { icon: '✍', title: 'Kanji Stroke Practice', desc: 'Animated stroke-order playback and digital tracing for every kanji — so you learn the character, not just the meaning.' },
  { icon: '📋', title: 'Exam-Format Tests',    desc: 'Full JLPT-format mock tests with timed sections, scoring, and detailed analytics to track readiness.' },
  { icon: '📈', title: 'Smart Analytics',      desc: 'Weak-point detection, readiness score, and personalized study plans that adapt as you improve.' },
]

const STATS = [
  { val: '2,136', label: 'Kanji covered (N5→N1)' },
  { val: '8,334+', label: 'Vocabulary items' },
  { val: '450+', label: 'Grammar patterns' },
  { val: '5', label: 'JLPT levels' },
]

export default function AboutPage() {
  return (
    <div className="page-shell">

      {/* Hero */}
      <motion.div
        className="clay-card clay-card--lg"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ position: 'relative', overflow: 'hidden' }}
      >
        <p className="eyebrow">About JLPT Learning</p>
        <h1 className="page-title" style={{ marginTop: 8 }}>A premium path to Japanese fluency.</h1>
        <p className="page-subtitle" style={{ marginTop: 12 }}>
          Beautiful design meets deliberate study science. Every session is structured, every lesson culturally grounded, and every feature built to make your path to JLPT success clear and motivating.
        </p>
        <div style={{ display: 'flex', gap: 10, marginTop: 20, flexWrap: 'wrap' }}>
          <Link to="/levels"    className="primary-btn">Start Learning →</Link>
          <Link to="/dashboard" className="secondary-btn">Dashboard</Link>
        </div>
        <span style={{ position: 'absolute', right: 24, top: '50%', transform: 'translateY(-50%)', fontSize: '7rem', fontWeight: 900, color: 'rgba(201,122,74,0.05)', pointerEvents: 'none', userSelect: 'none' }}>語</span>
      </motion.div>

      {/* Stats */}
      <motion.div
        className="clay-card"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 20 }}>
          {STATS.map(s => (
            <div key={s.label} style={{ textAlign: 'center', padding: '16px 0' }}>
              <div style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--terracotta)' }}>{s.val}</div>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--muted-plum)', marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Pillars */}
      <div>
        <div className="section-header" style={{ marginBottom: 16 }}>
          <span className="section-title">Why JLPT Learning</span>
        </div>
        <div className="grid-3">
          {PILLARS.map((p, i) => (
            <motion.div
              key={p.title}
              className="content-card"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.07 }}
            >
              <div style={{ fontSize: '2rem', marginBottom: 12 }}>{p.icon}</div>
              <h3>{p.title}</h3>
              <p style={{ marginTop: 6 }}>{p.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Philosophy */}
      <motion.div
        className="clay-card"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <div className="section-title" style={{ marginBottom: 16 }}>Our Philosophy</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {[
            'Language learning should feel like cultural discovery, not rote memorization.',
            'Every kanji stroke carries history. Every grammar pattern reflects how people think.',
            'Consistency beats intensity — a calm daily practice outperforms weekend cramming every time.',
            'Beautiful tools make hard work feel worthwhile.',
          ].map((q, i) => (
            <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', padding: '12px 16px', borderRadius: 14, background: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.7)' }}>
              <span style={{ color: 'var(--terracotta)', fontWeight: 800, fontSize: '1rem', marginTop: 1 }}>〝</span>
              <p style={{ fontSize: '0.92rem', color: 'var(--dark-ink)', fontWeight: 600, lineHeight: 1.65, margin: 0 }}>{q}</p>
            </div>
          ))}
        </div>
      </motion.div>

    </div>
  )
}
