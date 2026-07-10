import { motion } from 'framer-motion'
import { Link, useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import api from '../lib/api'

const SECTIONS = [
  { icon: '字', label: 'Kanji',      basePath: 'kanji',      desc: 'Stroke order, readings, and tracing practice' },
  { icon: '語', label: 'Vocabulary', basePath: 'vocabulary', desc: 'SRS flashcards and contextual examples' },
  { icon: '文', label: 'Grammar',    basePath: 'grammar',    desc: 'Pattern explanations and interactive drills' },
  { icon: '📖', label: 'Reading',    basePath: 'practice',   desc: 'Graded passages with comprehension questions' },
  { icon: '👂', label: 'Listening',  basePath: 'practice',   desc: 'Audio passages and answer practice' },
  { icon: '📋', label: 'Mock Test',  basePath: 'tests',      desc: 'Full-format timed practice exam' },
]

export default function LevelDetailPage() {
  const { levelId } = useParams()
  const code = levelId?.toUpperCase() ?? 'N3'
  const [lvl, setLvl] = useState(null)
  const [loading, setLoading] = useState(true)

  const getCount = (level, key) => level?.stats?.[key] ?? level?.[key] ?? 0

  useEffect(() => {
    let active = true
    const load = async () => {
      try {
        const { data } = await api.get(`/api/v1/levels/${encodeURIComponent(code)}`)
        if (!active) return
        setLvl(data)
      } catch (err) {
        if (active) setLvl(null)
      } finally {
        if (active) setLoading(false)
      }
    }
    load()
    return () => { active = false }
  }, [code])

  if (loading) {
    return <div className="page-shell"><div className="content-card" style={{ textAlign: 'center', color: 'var(--muted-plum)' }}>Loading level details from the database…</div></div>
  }

  if (!lvl) {
    return <div className="page-shell"><div className="content-card" style={{ textAlign: 'center', color: 'var(--muted-plum)' }}>Unable to load this level right now.</div></div>
  }

  return (
    <div className="page-shell">

      {/* Header card */}
      <motion.div
        className="clay-card clay-card--lg"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ borderLeft: `4px solid ${lvl.color}`, position: 'relative', overflow: 'hidden' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16, flexWrap: 'wrap' }}>
          <div style={{
            background: `linear-gradient(135deg, ${lvl.color}, ${lvl.color}cc)`,
            color: 'white', fontWeight: 900, fontSize: '1.8rem',
            borderRadius: 16, padding: '10px 22px',
            boxShadow: `0 6px 20px ${lvl.color}45`,
          }}>
            {code}
          </div>
          <div>
            <h1 className="page-title">{lvl.title}</h1>
            <p style={{ color: 'var(--muted-plum)', fontSize: '0.9rem', marginTop: 2 }}>{lvl.jp} · JLPT {code}</p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 28, flexWrap: 'wrap', marginBottom: 20 }}>
          {[
            { label: 'Kanji',   val: getCount(lvl, 'kanji').toLocaleString() },
            { label: 'Vocab',   val: getCount(lvl, 'vocab').toLocaleString() },
            { label: 'Grammar', val: getCount(lvl, 'grammar') },
          ].map(m => (
            <div key={m.label}>
              <div style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--dark-ink)' }}>{m.val}</div>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--muted-plum)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{m.label}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <Link to="/lessons"  className="primary-btn">Start Lessons →</Link>
          <Link to="/tests"    className="secondary-btn">Take Mock Test</Link>
          <Link to="/levels"   className="ghost-btn">← All Levels</Link>
        </div>

        <span style={{ position: 'absolute', right: 24, top: '50%', transform: 'translateY(-50%)', fontSize: '7rem', fontWeight: 900, color: `${lvl.color}12`, pointerEvents: 'none', userSelect: 'none' }}>
          {code}
        </span>
      </motion.div>

      {/* Curriculum sections */}
      <div>
        <div className="section-header" style={{ marginBottom: 16 }}>
          <span className="section-title">Curriculum Sections</span>
        </div>
        <div className="grid-3">
          {SECTIONS.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.07 }}
            >
              <Link to={`/${s.basePath}/${code}`} className="content-card" style={{ textDecoration: 'none', display: 'block' }}>
                <div style={{ fontSize: '2rem', marginBottom: 10 }}>{s.icon}</div>
                <h3>{s.label}</h3>
                <p style={{ marginTop: 4 }}>{s.desc}</p>
                <div style={{ marginTop: 14, color: 'var(--terracotta)', fontSize: '0.82rem', fontWeight: 700 }}>
                  Study now →
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Topics covered */}
      <motion.div
        className="clay-card"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <div className="section-title" style={{ marginBottom: 16 }}>Topics Covered at {code}</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 10 }}>
          {lvl.topics.map((t, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 12, background: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.7)' }}>
              <span style={{ color: lvl.color, fontWeight: 700 }}>✓</span>
              <span style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--dark-ink)' }}>{t}</span>
            </div>
          ))}
        </div>
      </motion.div>

    </div>
  )
}
