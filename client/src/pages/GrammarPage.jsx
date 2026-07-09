import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link, useParams } from 'react-router-dom'
import api from '../lib/api'

const LEVELS = ['All', 'N5', 'N4', 'N3', 'N2', 'N1']
const LEVEL_COLORS = { N5: '#059669', N4: '#0284c7', N3: '#7c3aed', N2: '#b45309', N1: '#be123c' }
const LEVEL_RE = /^N[1-5]$/i

const STAGES = {
  new:    { label: 'New',    color: '#0284c7', bg: 'rgba(56,189,248,0.12)'  },
  review: { label: 'Review', color: '#b45309', bg: 'rgba(251,191,36,0.12)' },
  known:  { label: 'Known',  color: '#059669', bg: 'rgba(52,211,153,0.12)' },
}

const POS_COLORS = { noun: '#7c3aed', verb: '#0284c7', adj: '#b45309', phrase: '#059669', word: '#c97a4a' }

function GrammarCard({ g, expanded, onToggle }) {
  const color = LEVEL_COLORS[g.level] ?? 'var(--terracotta)'
  return (
    <motion.div
      className="content-card"
      layout
      style={{ cursor: 'pointer', borderLeft: expanded ? `3px solid ${color}` : '1px solid rgba(255,255,255,0.8)' }}
      onClick={onToggle}
    >
      <div style={{ display: 'flex', align: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
        <div>
          <div style={{ fontSize: '1.3rem', fontWeight: 900, color: 'var(--dark-ink)', marginBottom: 4 }}>{g.pattern}</div>
          <div style={{ fontSize: '0.9rem', color: 'var(--muted-plum)' }}>{g.meaning}</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'flex-end', flexShrink: 0 }}>
          <span className={`badge badge-${g.level.toLowerCase()}`}>{g.level}</span>
          <span style={{ fontSize: '0.72rem', color: 'var(--terracotta)', fontWeight: 700 }}>{expanded ? '▲' : '▼'}</span>
        </div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            style={{ overflow: 'hidden' }}
            onClick={e => e.stopPropagation()}
          >
            <hr className="divider" style={{ margin: '14px 0' }} />

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--muted-plum)', marginBottom: 4 }}>Structure</div>
                <div style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--dark-ink)', fontFamily: 'var(--font-mono)', padding: '8px 12px', background: 'rgba(201,122,74,0.06)', borderRadius: 10 }}>{g.structure}</div>
              </div>

              <div>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--muted-plum)', marginBottom: 6 }}>Example</div>
                <div style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--dark-ink)' }}>{g.example}</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--muted-plum)', marginTop: 4 }}>{g.translation}</div>
              </div>

              <div className="notice notice-gold">{g.note}</div>

              <div>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--muted-plum)', marginBottom: 6 }}>More examples</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {g.conjugations.map(c => (
                    <div key={c} style={{ fontSize: '0.85rem', color: 'var(--dark-ink)', padding: '6px 10px', borderRadius: 8, background: 'rgba(255,255,255,0.6)' }}>
                      • {c}
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', gap: 8 }}>
                <Link to="/practice" className="primary-btn btn-sm" onClick={e => e.stopPropagation()}>Practice drill</Link>
                <Link to="/flashcards" className="ghost-btn btn-sm" onClick={e => e.stopPropagation()}>Add to SRS</Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default function GrammarPage() {
  const { levelOrId } = useParams()
  const levelParam = levelOrId && LEVEL_RE.test(levelOrId) ? levelOrId.toUpperCase() : null

  const [activeLevel, setActiveLevel] = useState(levelParam ?? 'All')
  const [search, setSearch]           = useState('')
  const [expanded, setExpanded]       = useState(null)
  const [items, setItems]             = useState([])
  const [loading, setLoading]         = useState(true)
  const [error, setError]             = useState('')

  const effectiveLevel = levelParam ?? activeLevel

  useEffect(() => {
    let active = true
    const timeoutId = window.setTimeout(async () => {
      setLoading(true)
      try {
        const params = new URLSearchParams()
        if (effectiveLevel !== 'All') params.set('level', effectiveLevel)
        if (search.trim()) params.set('search', search.trim())

        const { data } = await api.get(`/api/v1/grammar${params.toString() ? `?${params.toString()}` : ''}`)
        if (!active) return
        setItems(data.grammar ?? [])
        setError('')
      } catch (err) {
        if (active) {
          setItems([])
          setError('Unable to load grammar patterns from the database right now.')
        }
      } finally {
        if (active) setLoading(false)
      }
    }, 250)

    return () => {
      active = false
      window.clearTimeout(timeoutId)
    }
  }, [effectiveLevel, search])

  const filtered = items

  return (
    <div className="page-shell">

      <motion.div className="clay-card" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        {levelParam && (
          <Link to="/grammar" className="ghost-btn btn-sm" style={{ marginBottom: 12, display: 'inline-flex' }}>
            ← All Grammar
          </Link>
        )}
        <p className="eyebrow">Grammar Library</p>
        <h1 className="page-title" style={{ marginTop: 8 }}>
          {levelParam ? `${levelParam} Grammar Patterns` : 'Master Grammar Patterns'}
        </h1>
        <p className="page-subtitle" style={{ marginTop: 10 }}>
          {levelParam
            ? `All ${levelParam} grammar patterns with structure, examples, and drill exercises.`
            : 'Each pattern with structure, example sentences, usage notes, and drill exercises. Tap a card to expand its full explanation.'}
        </p>
        <div style={{ marginTop: 16, display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          <input
            className="field-input"
            placeholder="Search patterns or meanings…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ flex: '1 1 240px', maxWidth: 360 }}
          />
          <Link to="/practice" className="secondary-btn">Grammar Drills →</Link>
        </div>
      </motion.div>

      <div className="filter-bar">
        {!levelParam && LEVELS.map(l => (
          <button key={l} className={`filter-pill ${activeLevel === l ? 'active' : ''}`} onClick={() => setActiveLevel(l)}>{l}</button>
        ))}
        {levelParam && (
          <span
            className="filter-pill active"
            style={{ background: LEVEL_COLORS[levelParam], color: '#fff', border: 'none' }}
          >
            {levelParam}
          </span>
        )}
        <span style={{ marginLeft: 'auto', fontSize: '0.82rem', color: 'var(--muted-plum)', fontWeight: 600 }}>{items.length} patterns</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {loading && (
          <div className="content-card" style={{ textAlign: 'center', color: 'var(--muted-plum)' }}>
            Loading grammar patterns from the database…
          </div>
        )}
        {!loading && error && (
          <div className="content-card" style={{ textAlign: 'center', color: 'var(--muted-plum)' }}>
            {error}
          </div>
        )}
        {!loading && !error && filtered.length === 0 && (
          <div className="content-card" style={{ textAlign: 'center', color: 'var(--muted-plum)' }}>
            No grammar patterns match your current filter.
          </div>
        )}
        {!loading && !error && filtered.map((g, i) => (
          <motion.div key={g.pattern ?? g.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <GrammarCard
              g={g}
              expanded={expanded === g.pattern}
              onToggle={() => setExpanded(prev => prev === g.pattern ? null : g.pattern)}
            />
          </motion.div>
        ))}
      </div>

    </div>
  )
}
