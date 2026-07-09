import { motion } from 'framer-motion'
import { Link, useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import api from '../lib/api'

const LEVEL_RE = /^N[1-5]$/i
const LEVEL_COLORS = { N5: '#059669', N4: '#0284c7', N3: '#7c3aed', N2: '#b45309', N1: '#be123c' }

export default function PracticePage() {
  const { levelOrId } = useParams()
  const levelParam = levelOrId && LEVEL_RE.test(levelOrId) ? levelOrId.toUpperCase() : null
  const levelColor = levelParam ? LEVEL_COLORS[levelParam] : 'var(--terracotta)'
  const [practiceState, setPracticeState] = useState({ modes: [], stats: {}, weakPoints: [] })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    const load = async () => {
      try {
        const { data } = await api.get('/api/v1/practice')
        if (!active) return
        setPracticeState({
          modes: data.modes ?? [],
          stats: data.stats ?? {},
          weakPoints: data.weakPoints ?? [],
        })
      } catch (err) {
        if (active) setPracticeState({ modes: [], stats: {}, weakPoints: [] })
      } finally {
        if (active) setLoading(false)
      }
    }
    load()
    return () => { active = false }
  }, [])

  const dailyStats = [
    { label: 'Reviewed', val: String(practiceState.stats.reviewed ?? 0), unit: 'cards' },
    { label: 'Accuracy', val: String(practiceState.stats.accuracy ?? 0), unit: '%' },
    { label: 'XP earned', val: `+${practiceState.stats.xpToday ?? 0}`, unit: 'XP' },
    { label: 'Time', val: String(practiceState.stats.minutesStudied ?? 0), unit: 'min' },
  ]

  return (
    <div className="page-shell">

      {/* Header */}
      <motion.div
        className="clay-card clay-card--lg"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ position: 'relative', overflow: 'hidden' }}
      >
        {levelParam && (
          <Link to="/practice" className="ghost-btn btn-sm" style={{ marginBottom: 12, display: 'inline-flex' }}>
            ← All Practice
          </Link>
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          {levelParam && (
            <span style={{
              background: `linear-gradient(135deg, ${levelColor}, ${levelColor}cc)`,
              color: '#fff', fontWeight: 900, fontSize: '1.1rem',
              borderRadius: 12, padding: '6px 16px',
              boxShadow: `0 4px 12px ${levelColor}40`,
            }}>
              {levelParam}
            </span>
          )}
          <p className="eyebrow">Practice Hub</p>
        </div>
        <h1 className="page-title" style={{ marginTop: 8 }}>
          {levelParam ? `${levelParam} Practice Drills` : 'Daily Drills & Practice'}
        </h1>
        <p className="page-subtitle" style={{ marginTop: 10 }}>
          {levelParam
            ? `Practice modes focused on ${levelParam} content — kanji, vocabulary, grammar, and listening at your level.`
            : 'Targeted practice modes built around your weak points and SRS schedule. Every session moves you closer to JLPT readiness.'}
        </p>

        {/* Daily stats */}
        <div style={{ display: 'flex', gap: 20, marginTop: 20, flexWrap: 'wrap' }}>
          {dailyStats.map(s => (
            <div key={s.label} style={{ display: 'flex', flex: 'column', gap: 2 }}>
              <div style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--dark-ink)' }}>
                {s.val}<span style={{ fontSize: '0.75rem', color: 'var(--muted-plum)', marginLeft: 2 }}>{s.unit}</span>
              </div>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--muted-plum)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>{s.label}</div>
            </div>
          ))}
        </div>

        <span style={{ position: 'absolute', right: 24, top: '50%', transform: 'translateY(-50%)', fontSize: '7rem', fontWeight: 900, color: 'rgba(201,122,74,0.05)', pointerEvents: 'none', userSelect: 'none' }}>練</span>
      </motion.div>

      {/* Practice modes */}
      <div>
        <div className="section-header" style={{ marginBottom: 16 }}>
          <span className="section-title">Practice Modes</span>
          <Link to="/study-plan" className="ghost-btn btn-sm">View study plan →</Link>
        </div>

        <div className="grid-3">
          {loading && (
            <div className="content-card" style={{ gridColumn: '1 / -1', textAlign: 'center', color: 'var(--muted-plum)' }}>
              Loading practice modes from the database…
            </div>
          )}
          {!loading && practiceState.modes.length === 0 && (
            <div className="content-card" style={{ gridColumn: '1 / -1', textAlign: 'center', color: 'var(--muted-plum)' }}>
              No practice data is available yet.
            </div>
          )}
          {practiceState.modes.map((m, i) => (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.07 }}
            >
              <Link to={m.link ?? '/practice'} className="content-card" style={{ textDecoration: 'none', display: 'block', background: `linear-gradient(135deg, rgba(255,255,255,0.94), ${m.bg ?? 'rgba(255,255,255,0.55)'})` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                  <div style={{
                    width: 52, height: 52, borderRadius: 16,
                    background: `linear-gradient(135deg, ${m.color}22, ${m.color}10)`,
                    border: `1px solid ${m.color}30`,
                    display: 'grid', placeItems: 'center',
                    fontSize: '1.5rem', fontWeight: 900, color: m.color,
                  }}>
                    {m.icon}
                  </div>
                  <div>
                    <h3 style={{ color: 'var(--dark-ink)', marginBottom: 2 }}>{m.title}</h3>
                    <div style={{ fontSize: '0.78rem', color: m.color, fontWeight: 700 }}>{m.subtitle ?? 'From your dashboard data'}</div>
                  </div>
                </div>

                <p style={{ fontSize: '0.85rem', color: 'var(--muted-plum)', lineHeight: 1.65 }}>{m.desc}</p>

                <div style={{ marginTop: 12, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {(m.tags ?? []).map(t => (
                    <span key={t} style={{ fontSize: '0.68rem', fontWeight: 700, padding: '2px 8px', borderRadius: 999, background: `${m.color}14`, color: m.color }}>
                      {t}
                    </span>
                  ))}
                </div>

                <div style={{ marginTop: 14, color: m.color, fontSize: '0.82rem', fontWeight: 700 }}>Start practice →</div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Recommended */}
      <motion.div
        className="clay-card"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <div className="section-title" style={{ marginBottom: 16 }}>Recommended for You</div>
        {practiceState.weakPoints.length > 0 ? (
          <>
            <div className="notice notice-gold">
              <strong>Weak point detected</strong> — your database-based progress shows the lowest mastery in {practiceState.weakPoints[0].topic.toLowerCase()} at {practiceState.weakPoints[0].accuracy}%.
              Focus on that area next to raise your readiness.
            </div>
            <div style={{ marginTop: 14, display: 'flex', gap: 10 }}>
              <Link to="/flashcards" className="primary-btn">Start review</Link>
              <Link to="/progress"   className="secondary-btn">View analytics</Link>
            </div>
          </>
        ) : (
          <div className="notice notice-gold">
            Your practice plan is still being built from your progress data. Start a lesson to unlock better recommendations.
          </div>
        )}
      </motion.div>

    </div>
  )
}
