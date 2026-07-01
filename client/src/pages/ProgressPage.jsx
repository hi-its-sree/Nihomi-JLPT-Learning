import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

function ProgressRing({ pct = 0, size = 96, stroke = 10, color = '#c97a4a', label = '' }) {
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const off = c - (pct / 100) * c
  return (
    <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(201,122,74,0.1)" strokeWidth={stroke}/>
        <motion.circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={c} initial={{ strokeDashoffset: c }} animate={{ strokeDashoffset: off }}
          transition={{ duration: 1.4, ease: [0.25, 0.46, 0.45, 0.94], delay: 0.4 }}/>
      </svg>
      <div style={{ position: 'absolute', textAlign: 'center', lineHeight: 1 }}>
        <div style={{ fontSize: '1.1rem', fontWeight: 900, color: 'var(--dark-ink)' }}>{pct}%</div>
        {label && <div style={{ fontSize: '0.58rem', color: 'var(--muted-plum)', marginTop: 2, fontWeight: 600 }}>{label}</div>}
      </div>
    </div>
  )
}

const MASTERY = [
  { label: 'Kanji',      pct: 10, done: 65,   total: 650,  color: '#c97a4a', icon: '字' },
  { label: 'Vocabulary', pct: 19, done: 280,  total: 1500, color: '#7c3aed', icon: '語' },
  { label: 'Grammar',    pct: 38, done: 45,   total: 120,  color: '#0284c7', icon: '文' },
  { label: 'Reading',    pct: 30, done: 12,   total: 40,   color: '#059669', icon: '📖' },
  { label: 'Listening',  pct: 22, done: 8,    total: 36,   color: '#b45309', icon: '👂' },
]

const TEST_HISTORY = [
  { name: 'N3 Full Mock #1', score: 74, date: '2026-06-22', sections: { vocab: 80, grammar: 72, reading: 78, listening: 62 } },
  { name: 'N3 Vocabulary',   score: 85, date: '2026-06-25', sections: { vocab: 85 } },
  { name: 'N4 Full Mock #1', score: 92, date: '2026-06-10', sections: { vocab: 95, grammar: 90, reading: 94, listening: 88 } },
  { name: 'N5 Complete',     score: 96, date: '2026-05-30', sections: { vocab: 98, grammar: 96, reading: 95 } },
]

const WEAKPOINTS = [
  { area: 'Listening (N3)', pct: 62, advice: 'More audio practice with N3 passages' },
  { area: 'Grammar — Causative', pct: 55, advice: 'Review 〜させる patterns and drill exercises' },
  { area: 'Kanji readings', pct: 58, advice: 'Focus on on-yomi vs kun-yomi distinction' },
]

export default function ProgressPage() {
  return (
    <div className="page-shell">

      {/* Overview */}
      <motion.div className="clay-card clay-card--lg" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <p className="eyebrow">Learning Analytics</p>
        <h1 className="page-title" style={{ marginTop: 8 }}>Your Progress</h1>
        <p className="page-subtitle" style={{ marginTop: 10 }}>
          Track readiness, identify weak points, and see exactly where your next study session should focus.
        </p>
      </motion.div>

      {/* Readiness + top stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 24, alignItems: 'start', flexWrap: 'wrap' }}>
        <motion.div className="clay-card" style={{ textAlign: 'center', minWidth: 180 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
          <p style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--muted-plum)', marginBottom: 12 }}>N3 Readiness</p>
          <ProgressRing pct={82} size={120} stroke={12} color="#c97a4a" label="Target N3"/>
          <p style={{ fontSize: '0.82rem', color: 'var(--muted-plum)', marginTop: 10, lineHeight: 1.5 }}>You're exam-ready.<br/>Keep refining weak points.</p>
        </motion.div>

        <motion.div className="clay-card" style={{ display: 'flex', flexDirection: 'column', gap: 16 }} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
          {[
            { label: 'Study streak', val: '7', unit: 'days', icon: '🔥' },
            { label: 'Total XP earned', val: '1,250', unit: 'XP', icon: '⭐' },
            { label: 'Lessons completed', val: '24', unit: 'this month', icon: '✅' },
            { label: 'Mock tests taken', val: '4', unit: 'total', icon: '📋' },
          ].map(s => (
            <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: '1.2rem', width: 28 }}>{s.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--muted-plum)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{s.label}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '1.1rem', fontWeight: 900, color: 'var(--dark-ink)' }}>{s.val}</span>
                <span style={{ fontSize: '0.72rem', color: 'var(--muted-plum)', marginLeft: 4 }}>{s.unit}</span>
              </div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Mastery breakdown */}
      <motion.div className="clay-card" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
        <div className="section-header" style={{ marginBottom: 20 }}>
          <span className="section-title">Mastery by Category</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 20 }}>
          {MASTERY.map(m => (
            <div key={m.label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
              <ProgressRing pct={m.pct} size={80} stroke={8} color={m.color} />
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--dark-ink)' }}>{m.icon} {m.label}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--muted-plum)', marginTop: 2 }}>{m.done} / {m.total}</div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Weak points */}
      <motion.div className="clay-card" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
        <div className="section-header" style={{ marginBottom: 16 }}>
          <span className="section-title">Weak Points</span>
          <Link to="/practice" className="ghost-btn btn-sm">Start focused drill →</Link>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {WEAKPOINTS.map(w => (
            <div key={w.area} style={{ padding: '14px 16px', borderRadius: 16, background: 'rgba(255,255,255,0.65)', border: '1px solid rgba(255,255,255,0.7)', display: 'flex', gap: 14, alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{ minWidth: 52, textAlign: 'center' }}>
                <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#c0503c' }}>{w.pct}%</div>
                <div style={{ width: 52, height: 6, borderRadius: 999, background: 'rgba(192,80,60,0.12)', marginTop: 4 }}>
                  <motion.div style={{ height: '100%', borderRadius: 999, background: '#c0503c' }} initial={{ width: 0 }} animate={{ width: `${w.pct}%` }} transition={{ duration: 1 }} />
                </div>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--dark-ink)', marginBottom: 3 }}>{w.area}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--muted-plum)' }}>{w.advice}</div>
              </div>
              <Link to="/practice" className="ghost-btn btn-sm" style={{ flexShrink: 0 }}>Practice →</Link>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Test history */}
      <motion.div className="clay-card" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
        <div className="section-header" style={{ marginBottom: 16 }}>
          <span className="section-title">Test History</span>
          <Link to="/tests" className="ghost-btn btn-sm">All tests →</Link>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {TEST_HISTORY.map((t, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 16px', borderRadius: 16, background: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.7)', flexWrap: 'wrap' }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--dark-ink)' }}>{t.name}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--muted-plum)', marginTop: 2 }}>{t.date}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 120 }}>
                  <div className="progress-bar-wrap">
                    <motion.div className="progress-bar-fill" style={{ background: `linear-gradient(90deg, ${t.score >= 80 ? '#059669' : t.score >= 60 ? '#c97a4a' : '#c0503c'}, ${t.score >= 80 ? '#059669' : t.score >= 60 ? '#c97a4a' : '#c0503c'}aa)` }} initial={{ width: 0 }} animate={{ width: `${t.score}%` }} transition={{ duration: 1, delay: 0.2 + i * 0.08 }} />
                  </div>
                </div>
                <div style={{ fontWeight: 900, fontSize: '1rem', color: t.score >= 80 ? '#059669' : t.score >= 60 ? '#c97a4a' : '#c0503c', minWidth: 36 }}>{t.score}%</div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

    </div>
  )
}
