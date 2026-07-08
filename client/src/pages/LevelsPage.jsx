import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import api from '../lib/api'

const LEVELS = [
  {
    code: 'N5',
    title: 'Beginner',
    jp: '初級',
    kanji: 100,
    vocab: 800,
    grammar: 50,
    focus: 'Hiragana, katakana, daily phrases, numbers, greetings',
    color: '#059669',
    colorBg: 'rgba(52,211,153,0.10)',
    colorBorder: 'rgba(52,211,153,0.25)',
    progress: 100,
    badge: 'badge-n5',
    emoji: '🌱',
  },
  {
    code: 'N4',
    title: 'Elementary',
    jp: '基礎',
    kanji: 300,
    vocab: 1500,
    grammar: 100,
    focus: 'Practical grammar, reading short texts, basic conversation',
    color: '#0284c7',
    colorBg: 'rgba(56,189,248,0.10)',
    colorBorder: 'rgba(56,189,248,0.25)',
    progress: 62,
    badge: 'badge-n4',
    emoji: '🌿',
  },
  {
    code: 'N3',
    title: 'Intermediate',
    jp: '中級',
    kanji: 650,
    vocab: 3750,
    grammar: 200,
    focus: 'Broader vocabulary, listening comprehension, nuanced reading',
    color: '#7c3aed',
    colorBg: 'rgba(167,139,250,0.10)',
    colorBorder: 'rgba(167,139,250,0.25)',
    progress: 30,
    badge: 'badge-n3',
    emoji: '🌸',
    current: true,
  },
  {
    code: 'N2',
    title: 'Upper-Intermediate',
    jp: '上中級',
    kanji: 1000,
    vocab: 6000,
    grammar: 300,
    focus: 'Complex grammar structures, newspaper reading, business situations',
    color: '#b45309',
    colorBg: 'rgba(251,191,36,0.10)',
    colorBorder: 'rgba(251,191,36,0.25)',
    progress: 0,
    badge: 'badge-n2',
    emoji: '🎋',
  },
  {
    code: 'N1',
    title: 'Advanced',
    jp: '上級',
    kanji: 2136,
    vocab: 10000,
    grammar: 450,
    focus: 'Academic texts, literature, nuanced expression, advanced idioms',
    color: '#be123c',
    colorBg: 'rgba(251,113,133,0.10)',
    colorBorder: 'rgba(251,113,133,0.25)',
    progress: 0,
    badge: 'badge-n1',
    emoji: '⛩',
  },
]

const initialLevelsState = LEVELS.map(l => ({ ...l, progress: 0, current: false }))

export default function LevelsPage() {
  const [levelsState, setLevelsState] = useState(initialLevelsState)
  const [masteryData, setMasteryData] = useState([])

  useEffect(() => {
    let active = true
    const load = async () => {
      try {
        const [dashRes, progRes] = await Promise.all([
          api.get('/api/v1/dashboard').catch(() => ({ data: {} })),
          api.get('/api/v1/progress').catch(() => ({ data: {} })),
        ])
        if (!active) return
        const targetLevel = dashRes.data?.target?.level
        const mastery = progRes.data?.mastery ?? []
        const levelOrder = ['N5', 'N4', 'N3', 'N2', 'N1']
        const targetIndex = levelOrder.indexOf(targetLevel)

        const relevant = mastery.filter(m => ['Kanji', 'Vocabulary', 'Grammar', 'Reading'].includes(m.label))
        const avg = relevant.length > 0 ? Math.round(relevant.reduce((s, r) => s + (r.pct || 0), 0) / relevant.length) : 0

        setMasteryData(relevant)
        setLevelsState(LEVELS.map(l => {
          const levelIndex = levelOrder.indexOf(l.code)
          const isCurrent = l.code === targetLevel
          const progress = isCurrent
            ? avg
            : targetIndex >= 0 && levelIndex < targetIndex
              ? 100
              : 0

          return {
            ...l,
            current: isCurrent,
            progress,
          }
        }))
      } catch (err) {
        // keep defaults on error
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
                        { label: 'Kanji',     val: lvl.kanji.toLocaleString() },
                        { label: 'Vocab',     val: lvl.vocab.toLocaleString() },
                        { label: 'Grammar',   val: lvl.grammar },
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
                    {lvl.current && masteryData.length > 0 && (
                      <div style={{ marginTop: 10, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        {masteryData.map(item => (
                          <div key={item.label} style={{ padding: '6px 10px', borderRadius: 999, background: 'rgba(245,245,245,0.9)', border: '1px solid rgba(221,221,221,0.7)', color: 'var(--dark-ink)', fontSize: '0.75rem', fontWeight: 700 }}>
                            {item.label}: {item.pct}%
                          </div>
                        ))}
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
