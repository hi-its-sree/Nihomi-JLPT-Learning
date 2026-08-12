import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Link, useSearchParams } from 'react-router-dom'
import api from '../lib/api'
import { getKanjiStrokePaths } from '../lib/kanjiStrokeData.mjs'
import StrokeOrderPlayer from '../components/StrokeOrderPlayer'
import TracingCanvas from '../components/TracingCanvas'

const LEVELS = ['N5', 'N4', 'N3', 'N2', 'N1']
const MODES = [
  { key: 'trace', label: '✍ Trace', desc: 'Draw each stroke yourself and get it checked' },
  { key: 'watch', label: '▶ Watch', desc: 'Play the stroke order through and follow along' },
]

// The kanji list endpoint caps a page at 100, which is a sensible drill length
// anyway — a session is a slice of the level, not the whole thing.
const SESSION_SIZE = 100

export default function StrokePracticePage() {
  const [searchParams, setSearchParams] = useSearchParams()

  const [level, setLevel] = useState(() => {
    const fromUrl = (searchParams.get('level') || '').toUpperCase()
    return LEVELS.includes(fromUrl) ? fromUrl : 'N5'
  })
  const [mode, setMode] = useState(() => (searchParams.get('mode') === 'watch' ? 'watch' : 'trace'))

  const [kanji, setKanji] = useState([])
  const [index, setIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [strokes, setStrokes] = useState([])
  const [strokesLoading, setStrokesLoading] = useState(false)
  const [cleared, setCleared] = useState(() => new Set())

  const current = kanji[index]

  useEffect(() => {
    setSearchParams({ level, mode }, { replace: true })
  }, [level, mode, setSearchParams])

  // Kanji for the chosen level, easiest first — stroke count is the closest
  // thing to a difficulty ordering the data gives us.
  useEffect(() => {
    let mounted = true
    setLoading(true)
    setError('')
    api.get('/api/kanji', { params: { level, limit: SESSION_SIZE, sortBy: 'strokeCount', sortOrder: 'asc' } })
      .then(({ data }) => {
        if (!mounted) return
        const items = Array.isArray(data?.data) ? data.data : []
        setKanji(items)
        setIndex(0)
        setCleared(new Set())
      })
      .catch(() => {
        if (mounted) {
          setKanji([])
          setError('Unable to load kanji for this level right now.')
        }
      })
      .finally(() => { if (mounted) setLoading(false) })
    return () => { mounted = false }
  }, [level])

  // Stroke paths come from KanjiVG over the network, so they load per character.
  useEffect(() => {
    let mounted = true
    if (!current?.character) {
      setStrokes([])
      return undefined
    }
    setStrokesLoading(true)
    getKanjiStrokePaths(current.character, current.strokeCount)
      .then((paths) => { if (mounted) setStrokes(paths) })
      .catch(() => { if (mounted) setStrokes([]) })
      .finally(() => { if (mounted) setStrokesLoading(false) })
    return () => { mounted = false }
  }, [current?.character, current?.strokeCount])

  function goTo(nextIndex) {
    if (nextIndex < 0 || nextIndex >= kanji.length) return
    setIndex(nextIndex)
  }

  function handleComplete() {
    setCleared((prev) => new Set(prev).add(current.character))
  }

  const progressPct = kanji.length > 0 ? (cleared.size / kanji.length) * 100 : 0

  return (
    <div className="page-shell">

      {/* Header */}
      <motion.div className="clay-card" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <p className="eyebrow">Practice Hub</p>
        <h1 className="page-title" style={{ marginTop: 8 }}>Kanji Stroke Practice</h1>
        <p className="page-subtitle" style={{ marginTop: 10 }}>
          {mode === 'trace'
            ? 'Draw each stroke in order and get it checked against real stroke-order data. Wrong direction and wrong order are called out separately.'
            : 'Watch the stroke order play through, scrub to any stroke, and follow along at your own pace.'}
        </p>

        <div className="filter-bar" style={{ marginTop: 16 }}>
          {MODES.map((m) => (
            <button
              key={m.key}
              className={`filter-pill ${mode === m.key ? 'active' : ''}`}
              onClick={() => setMode(m.key)}
              title={m.desc}
            >
              {m.label}
            </button>
          ))}
          <select
            className="field-input"
            value={level}
            onChange={(e) => setLevel(e.target.value)}
            style={{ padding: '7px 14px', fontSize: '0.82rem', fontWeight: 700, borderRadius: 999, width: 'auto' }}
          >
            {LEVELS.map((l) => <option key={l} value={l}>{l} Kanji</option>)}
          </select>
          <Link to="/practice" className="ghost-btn btn-sm" style={{ marginLeft: 'auto' }}>← Practice</Link>
        </div>
      </motion.div>

      {loading && (
        <div className="content-card" style={{ textAlign: 'center', color: 'var(--muted-plum)' }}>
          Loading {level} kanji…
        </div>
      )}

      {!loading && error && (
        <div className="content-card" style={{ textAlign: 'center', color: 'var(--muted-plum)' }}>{error}</div>
      )}

      {!loading && !error && kanji.length === 0 && (
        <div className="content-card" style={{ textAlign: 'center', color: 'var(--muted-plum)' }}>
          No kanji found for {level}.
        </div>
      )}

      {!loading && !error && current && (
        <>
          {/* Session progress */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 700, color: 'var(--muted-plum)', marginBottom: 6 }}>
              <span>{index + 1} of {kanji.length} · {level}</span>
              <span>{cleared.size} completed</span>
            </div>
            <div className="progress-bar-wrap">
              <motion.div className="progress-bar-fill" animate={{ width: `${progressPct}%` }} transition={{ duration: 0.4 }} />
            </div>
          </div>

          <div className="grid-2" style={{ alignItems: 'start' }}>
            {/* Canvas / player */}
            <motion.div key={`${current.character}-${mode}`} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
              {strokesLoading && (
                <div className="content-card" style={{ textAlign: 'center', color: 'var(--muted-plum)' }}>
                  Loading stroke data for {current.character}…
                </div>
              )}
              {!strokesLoading && strokes.length === 0 && (
                <div className="content-card" style={{ textAlign: 'center', color: 'var(--muted-plum)' }}>
                  No stroke data available for {current.character}.
                </div>
              )}
              {!strokesLoading && strokes.length > 0 && (
                mode === 'trace'
                  ? <TracingCanvas strokes={strokes} character={current.character} onComplete={handleComplete} />
                  : <StrokeOrderPlayer strokes={strokes} />
              )}
            </motion.div>

            {/* Character info */}
            <motion.div className="clay-card" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ fontSize: '3.2rem', fontWeight: 900, color: 'var(--dark-ink)', lineHeight: 1 }}>
                  {current.character}
                </div>
                <div>
                  <span className={`badge badge-${(current.level || 'n5').toLowerCase()}`}>{current.level}</span>
                  <div style={{ fontSize: '0.78rem', color: 'var(--muted-plum)', fontWeight: 600, marginTop: 4 }}>
                    {current.strokeCount || strokes.length} strokes
                  </div>
                  {cleared.has(current.character) && (
                    <div style={{ fontSize: '0.75rem', color: '#059669', fontWeight: 700, marginTop: 4 }}>Traced ✓</div>
                  )}
                </div>
              </div>

              <p style={{ color: 'var(--dark-ink)', fontWeight: 700, marginTop: 14 }}>{current.meaning}</p>

              <div style={{ marginTop: 12, display: 'grid', gap: 8 }}>
                {current.onReadings?.length > 0 && (
                  <div style={{ fontSize: '0.82rem' }}>
                    <span style={{ color: 'var(--muted-plum)', fontWeight: 700 }}>On: </span>
                    <span style={{ color: 'var(--terracotta)', fontWeight: 700 }}>{current.onReadings.join('、')}</span>
                  </div>
                )}
                {current.kunReadings?.length > 0 && (
                  <div style={{ fontSize: '0.82rem' }}>
                    <span style={{ color: 'var(--muted-plum)', fontWeight: 700 }}>Kun: </span>
                    <span style={{ color: 'var(--terracotta)', fontWeight: 700 }}>{current.kunReadings.join('、')}</span>
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: 10, marginTop: 18, flexWrap: 'wrap' }}>
                <button className="secondary-btn btn-sm" onClick={() => goTo(index - 1)} disabled={index === 0}>
                  ← Previous
                </button>
                <button className="primary-btn btn-sm" onClick={() => goTo(index + 1)} disabled={index >= kanji.length - 1}>
                  Next kanji →
                </button>
                <Link to={`/kanji-detail/${encodeURIComponent(current.character)}`} className="ghost-btn btn-sm">
                  Full detail
                </Link>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </div>
  )
}
