import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import api from '../lib/api'

export default function LevelsPage() {
  const [levelsState, setLevelsState] = useState([])
  const [loading, setLoading] = useState(true)

  const getCount = (level, key) => level?.stats?.[key] ?? level?.[key] ?? 0

  useEffect(() => {
    let active = true
    const load = async () => {
      try {
        const { data } = await api.get('/api/v1/levels')
        if (!active) return
        setLevelsState(data.levels ?? [])
      } catch (err) {
        if (active) setLevelsState([])
      } finally {
        if (active) setLoading(false)
      }
    }
    load()
    const id = window.setInterval(load, 30000)
    return () => { active = false; window.clearInterval(id) }
  }, [])

  return (
    <div className="page-shell">

      <motion.div
        className="clay-card clay-card--lg"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{ position: 'relative', overflow: 'hidden' }}
      >
        <p className="eyebrow">JLPT Roadmap</p>
        <h1 className="page-title" style={{ marginTop: 8 }}>Choose Your Level</h1>
        <p className="page-subtitle" style={{ marginTop: 12 }}>
          Five proficiency levels — each with structured lessons, kanji, vocabulary,
          grammar, practice drills, and full mock tests tailored to the real exam.
        </p>
        <div style={{ marginTop: 20, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <Link to="/study-plan" className="primary-btn">View my study plan →</Link>
          <Link to="/progress"   className="secondary-btn">Check progress</Link>
        </div>
        {/* decorative kanji */}
        <span style={{ position: 'absolute', right: 32, top: '50%', transform: 'translateY(-50%)', fontSize: '8rem', fontWeight: 900, color: 'rgba(201,122,74,0.06)', pointerEvents: 'none', userSelect: 'none' }}>
          語
        </span>
      </motion.div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {loading && (
          <div className="content-card" style={{ textAlign: 'center', color: 'var(--muted-plum)' }}>
            Loading your JLPT levels from the database…
          </div>
        )}
        {!loading && levelsState.length === 0 && (
          <div className="content-card" style={{ textAlign: 'center', color: 'var(--muted-plum)' }}>
            No level data is available yet.
          </div>
        )}
        {levelsState.map((lvl, i) => (
          <motion.div
            key={lvl.code}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 + i * 0.08, duration: 0.45 }}
          >
            <Link
              to={`/levels/${lvl.code}`}
              style={{ textDecoration: 'none', display: 'block' }}
            >
              <div
                className="content-card"
                style={{
                  background: `linear-gradient(135deg, rgba(255,255,255,0.95), ${lvl.colorBg})`,
                  borderColor: lvl.current ? lvl.colorBorder : 'rgba(255,255,255,0.8)',
                  borderWidth: lvl.current ? '2px' : '1px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 20, flexWrap: 'wrap' }}>
                  {/* Level badge */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, minWidth: 64 }}>
                    <div style={{ fontSize: '2rem' }}>{lvl.emoji}</div>
                    <div style={{
                      background: `linear-gradient(135deg, ${lvl.color}, ${lvl.color}cc)`,
                      color: 'white',
                      fontWeight: 900,
                      fontSize: '1.1rem',
                      borderRadius: 12,
                      padding: '6px 14px',
                      letterSpacing: '0.04em',
                      boxShadow: `0 4px 14px ${lvl.color}40`,
                    }}>{lvl.code}</div>
                    {lvl.current && (
                      <span style={{ fontSize: '0.65rem', fontWeight: 700, color: lvl.color, letterSpacing: '0.08em' }}>
                        CURRENT
                      </span>
                    )}
                  </div>

                  {/* Level info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 6 }}>
                      <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--dark-ink)' }}>
                        {lvl.title}
                      </h3>
                      <span style={{ fontSize: '0.9rem', color: 'var(--muted-plum)' }}>({lvl.jp})</span>
                    </div>
                    <p style={{ fontSize: '0.88rem', color: 'var(--muted-plum)', lineHeight: 1.6, marginBottom: 12 }}>
                      {lvl.focus}
                    </p>

                    {/* Counts */}
                    <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 12 }}>
                      {[
                        { label: 'Kanji',   val: getCount(lvl, 'kanji').toLocaleString() },
                        { label: 'Vocab',   val: getCount(lvl, 'vocab').toLocaleString() },
                        { label: 'Grammar', val: getCount(lvl, 'grammar') },
                      ].map(m => (
                        <div key={m.label} style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                          <span style={{ fontSize: '1rem', fontWeight: 900, color: 'var(--dark-ink)' }}>{m.val}</span>
                          <span style={{ fontSize: '0.7rem', color: 'var(--muted-plum)', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>{m.label}</span>
                        </div>
                      ))}
                    </div>

                    {/* Progress */}
                    {lvl.progress > 0 && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                        <div className="progress-bar-wrap" style={{ flex: 1, minWidth: 180 }}>
                          <motion.div
                            className="progress-bar-fill"
                            style={{ background: `linear-gradient(90deg, ${lvl.color}, ${lvl.color}bb)` }}
                            initial={{ width: 0 }}
                            animate={{ width: `${lvl.progress}%` }}
                            transition={{ duration: 1.0, delay: 0.2 + i * 0.08, ease: [0.25, 0.46, 0.45, 0.94] }}
                          />
                        </div>
                        <span style={{ fontSize: '0.78rem', fontWeight: 700, color: lvl.color, minWidth: 32 }}>
                          {lvl.progress}%
                        </span>
                      </div>
                    )}
                    {lvl.progress === 0 && (
                      <span style={{ fontSize: '0.78rem', color: 'var(--muted-plum)', fontWeight: 600 }}>
                        Not started
                      </span>
                    )}
                    {lvl.current && (
                      <div style={{ marginTop: 10, fontSize: '0.78rem', fontWeight: 700, color: lvl.color }}>
                        Your active JLPT target
                      </div>
                    )}
                  </div>

                  {/* Arrow */}
                  <div style={{ color: 'var(--terracotta)', fontSize: '1.4rem', alignSelf: 'center', opacity: 0.6 }}>→</div>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

    </div>
  )
}
