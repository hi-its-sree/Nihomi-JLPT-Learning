import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import api from '../lib/api'

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

const defaultState = {
  mastery: [],
  weakPoints: [],
  history: [],
  xpHistory: [],
  streak: 0,
  totalXP: 0,
}

export default function ProgressPage() {
  const [data, setData] = useState(defaultState)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [target, setTarget] = useState(null)

  useEffect(() => {
    let active = true
    const load = async () => {
      try {
        setLoading(true)
        const [progressRes, dashRes] = await Promise.all([
          api.get('/api/v1/progress'),
          api.get('/api/v1/dashboard').catch(() => ({ data: {} })),
        ])
        if (!active) return
        setData(progressRes.data)
        setTarget(dashRes.data?.target ?? null)
        setError('')
      } catch (err) {
        if (active) setError('Unable to load progress data')
      } finally {
        if (active) setLoading(false)
      }
    }
    load()
    const id = window.setInterval(load, 30000)
    return () => { active = false; window.clearInterval(id) }
  }, [])

  const MASTERY = data.mastery || []
  const TEST_HISTORY = data.history || []
  const WEAKPOINTS = data.weakPoints || []

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
          <p style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--muted-plum)', marginBottom: 12 }}>{target?.level ? `${target.level} Readiness` : 'Readiness'}</p>
          <ProgressRing pct={data.readiness ?? 0} size={120} stroke={12} color="#c97a4a" label="Target"/>
          <p style={{ fontSize: '0.82rem', color: 'var(--muted-plum)', marginTop: 10, lineHeight: 1.5 }}>{data.readiness >= 80 ? "You're exam-ready." : 'Keep refining weak points.'}</p>
        </motion.div>

        <motion.div className="clay-card" style={{ display: 'flex', flexDirection: 'column', gap: 16 }} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
          {[
            { label: 'Study streak', val: `${data.streak}`, unit: 'days', icon: '🔥' },
            { label: 'Total XP earned', val: `${data.totalXP}`, unit: 'XP', icon: '⭐' },
            { label: 'Lessons completed', val: `${data.lessonsCompleted ?? 0}`, unit: 'total', icon: '✅' },
            { label: 'Mock tests taken', val: `${(data.testsTaken ?? 0)}`, unit: 'total', icon: '📋' },
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
          {MASTERY.length > 0 ? MASTERY.map(m => (
            <div key={m.label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
              <ProgressRing pct={m.pct} size={80} stroke={8} color={m.color} />
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--dark-ink)' }}>{m.icon} {m.label}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--muted-plum)', marginTop: 2 }}>{m.done} / {m.total}</div>
              </div>
            </div>
          )) : (
            <div style={{ color: 'var(--muted-plum)' }}>Mastery data will appear as you practice.</div>
          )}
        </div>
      </motion.div>

      {/* Weak points */}
      <motion.div className="clay-card" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
        <div className="section-header" style={{ marginBottom: 16 }}>
          <span className="section-title">Weak Points</span>
          <Link to="/practice" className="ghost-btn btn-sm">Start focused drill →</Link>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {WEAKPOINTS.length > 0 ? WEAKPOINTS.map(w => (
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
          )) : (
            <div style={{ color: 'var(--muted-plum)' }}>No weak points identified yet.</div>
          )}
        </div>
      </motion.div>

      {/* Test history */}
      <motion.div className="clay-card" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
        <div className="section-header" style={{ marginBottom: 16 }}>
          <span className="section-title">Test History</span>
          <Link to="/tests" className="ghost-btn btn-sm">All tests →</Link>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {TEST_HISTORY.length > 0 ? TEST_HISTORY.map((t, i) => (
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
          )) : (
            <div style={{ color: 'var(--muted-plum)' }}>No test history yet.</div>
          )}
        </div>
      </motion.div>

    </div>
  )
}
