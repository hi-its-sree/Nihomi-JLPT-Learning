import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Link, useParams } from 'react-router-dom'
import api from '../lib/api'
import DeckMenu from '../components/DeckMenu'
import FloatingMenu from '../components/FloatingMenu'

const STAGES = {
  new:    { label: 'New',    color: '#0284c7', bg: 'rgba(56,189,248,0.12)'  },
  review: { label: 'Review', color: '#b45309', bg: 'rgba(251,191,36,0.12)' },
  known:  { label: 'Known',  color: '#059669', bg: 'rgba(52,211,153,0.12)' },
}

const LEVELS = ['All', 'N5', 'N4', 'N3', 'N2', 'N1']
const POS_COLORS = { noun: '#7c3aed', verb: '#0284c7', adj: '#b45309', phrase: '#059669', word: '#c97a4a' }
const LEVEL_RE = /^N[1-5]$/i
const LEVEL_COLORS = { N5: '#059669', N4: '#0284c7', N3: '#7c3aed', N2: '#b45309', N1: '#be123c' }

export default function VocabularyPage() {
  const { levelOrId } = useParams()
  const levelParam = levelOrId && LEVEL_RE.test(levelOrId) ? levelOrId.toUpperCase() : null

  const [activeLevel, setActiveLevel] = useState(levelParam ?? 'All')
  const [search, setSearch]           = useState('')
  const [activeStage, setActiveStage] = useState('All')
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [flashcardIds, setFlashcardIds] = useState(() => new Set())
  const [pendingId, setPendingId] = useState(null)
  const [openMenu, setOpenMenu] = useState(null) // { id, top, right } | null

  const effectiveLevel = levelParam ?? activeLevel
  const filtered = items

  useEffect(() => {
    let active = true
    const timeoutId = window.setTimeout(async () => {
      setLoading(true)
      try {
        const params = new URLSearchParams()
        if (effectiveLevel !== 'All') params.set('level', effectiveLevel)
        if (activeStage !== 'All') params.set('stage', activeStage)
        if (search.trim()) params.set('search', search.trim())

        const { data } = await api.get(`/api/v1/vocabulary${params.toString() ? `?${params.toString()}` : ''}`)
        if (!active) return
        setItems(data.vocab ?? [])
        setError('')
      } catch (err) {
        if (active) {
          setItems([])
          setError('Unable to load vocabulary from the database right now.')
        }
      } finally {
        if (active) setLoading(false)
      }
    }, 250)

    return () => {
      active = false
      window.clearTimeout(timeoutId)
    }
  }, [effectiveLevel, activeStage, search])

  useEffect(() => {
    let mounted = true
    api.get('/api/v1/flashcards/vocab-ids')
      .then(({ data }) => {
        if (!mounted) return
        setFlashcardIds(new Set(data.vocabularyIds || []))
      })
      .catch(() => {})
    return () => { mounted = false }
  }, [])

  async function toggleFlashcard(vocabId) {
    if (!vocabId || pendingId) return
    const isAdded = flashcardIds.has(vocabId)

    // Optimistic — revert below if the request fails.
    setFlashcardIds(prev => {
      const next = new Set(prev)
      if (isAdded) next.delete(vocabId)
      else next.add(vocabId)
      return next
    })
    setPendingId(vocabId)

    try {
      if (isAdded) await api.delete(`/api/v1/flashcards/vocab/${vocabId}`)
      else await api.post(`/api/v1/flashcards/vocab/${vocabId}`)
    } catch {
      setFlashcardIds(prev => {
        const next = new Set(prev)
        if (isAdded) next.add(vocabId)
        else next.delete(vocabId)
        return next
      })
    } finally {
      setPendingId(null)
    }
  }

  return (
    <div className="page-shell">

      {/* Header */}
      <motion.div
        className="clay-card"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {levelParam && (
          <Link to="/vocabulary" className="ghost-btn btn-sm" style={{ marginBottom: 12, display: 'inline-flex' }}>
            ← All Vocabulary
          </Link>
        )}
        <p className="eyebrow">Vocabulary Library</p>
        <h1 className="page-title" style={{ marginTop: 8 }}>
          {levelParam ? `${levelParam} Vocabulary` : 'Build Your Word Bank'}
        </h1>
        <p className="page-subtitle" style={{ marginTop: 10 }}>
          {levelParam
            ? `All ${levelParam} words with pronunciation, meaning, and example usage. Study at your level.`
            : 'Every word with pronunciation, meaning, example usage, and SRS scheduling. Study words in context, not isolation.'}
        </p>
        <div style={{ marginTop: 16, display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          <input
            className="field-input"
            placeholder="Search words, meanings, or readings…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ flex: '1 1 240px', maxWidth: 360 }}
          />
          <Link
            to={`/flashcards?type=vocab&level=${effectiveLevel === 'All' ? 'N5' : effectiveLevel}`}
            className="primary-btn"
          >
            SRS Review →
          </Link>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div
        style={{ display: 'flex', flexDirection: 'column', gap: 10 }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15 }}
      >
        {!levelParam && (
          <div className="filter-bar">
            {LEVELS.map(l => (
              <button key={l} className={`filter-pill ${activeLevel === l ? 'active' : ''}`} onClick={() => setActiveLevel(l)}>{l}</button>
            ))}
          </div>
        )}
        <div className="filter-bar">
          {levelParam && (
            <span
              className="filter-pill active"
              style={{ background: LEVEL_COLORS[levelParam], color: '#fff', border: 'none' }}
            >
              {levelParam}
            </span>
          )}
          {['All', 'new', 'review', 'known'].map(s => (
            <button key={s} className={`filter-pill ${activeStage === s ? 'active' : ''}`} onClick={() => setActiveStage(s)}>
              {s === 'All' ? 'All status' : STAGES[s]?.label}
            </button>
          ))}
          <span style={{ marginLeft: 'auto', fontSize: '0.82rem', color: 'var(--muted-plum)', fontWeight: 600 }}>
            {items.length} words
          </span>
        </div>
      </motion.div>

      {/* Word grid */}
      {loading && (
        <div className="content-card" style={{ textAlign: 'center', color: 'var(--muted-plum)' }}>
          Loading vocabulary from the database…
        </div>
      )}
      {!loading && error && (
        <div className="content-card" style={{ textAlign: 'center', color: 'var(--muted-plum)' }}>{error}</div>
      )}
      {!loading && !error && filtered.length === 0 && (
        <div className="content-card" style={{ textAlign: 'center', color: 'var(--muted-plum)' }}>
          No vocabulary entries found for this filter.
        </div>
      )}
      {!loading && !error && filtered.length > 0 && (
        <div className="grid-2">
          {filtered.map((v, i) => {
            const stage = STAGES[v.stage] ?? STAGES.new
            const posColor = POS_COLORS[v.pos] ?? POS_COLORS.word
            const isAdded = flashcardIds.has(v.id)
            const isMenuOpen = openMenu?.id === v.id
            return (
              <motion.div
                key={v.id ?? v.word}
                className="content-card"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
                  <div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--dark-ink)', lineHeight: 1.2 }}>{v.word}</div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--terracotta)', fontWeight: 700, marginTop: 2 }}>{v.reading}</div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'flex-end' }}>
                    <span className={`badge badge-${(v.level ?? 'n5').toLowerCase()}`}>{v.level}</span>
                    <span style={{ fontSize: '0.68rem', fontWeight: 700, padding: '2px 8px', borderRadius: 999, background: `${posColor}18`, color: posColor }}>{v.pos}</span>
                  </div>
                </div>

                <p style={{ color: 'var(--dark-ink)', fontWeight: 700, fontSize: '0.95rem', marginTop: 10 }}>{v.meaning}</p>

                <div style={{ marginTop: 10, padding: '10px 12px', borderRadius: 12, background: 'rgba(201,122,74,0.06)', border: '1px solid rgba(201,122,74,0.12)' }}>
                  <span style={{ fontSize: '0.82rem', color: 'var(--muted-plum)' }}>{v.example}</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 12, gap: 8 }}>
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, padding: '3px 10px', borderRadius: 999, background: stage.bg, color: stage.color }}>
                    {stage.label}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <button
                      type="button"
                      className={isAdded ? 'primary-btn btn-sm' : 'ghost-btn btn-sm'}
                      style={{ fontSize: '0.75rem' }}
                      disabled={!v.id || pendingId === v.id}
                      onClick={() => toggleFlashcard(v.id)}
                    >
                      {isAdded ? 'In review ✓' : 'Add to review'}
                    </button>
                    <button
                      type="button"
                      aria-label="Collection actions"
                      disabled={!v.id}
                      onClick={(e) => {
                        if (isMenuOpen) {
                          setOpenMenu(null)
                          return
                        }
                        const rect = e.currentTarget.getBoundingClientRect()
                        setOpenMenu({ id: v.id, top: rect.bottom + 6, right: window.innerWidth - rect.right })
                      }}
                      style={{
                        width: 24, height: 24, borderRadius: '50%', border: 'none',
                        background: 'rgba(201,122,74,0.12)', color: 'var(--muted-plum)',
                        cursor: 'pointer', fontWeight: 900, lineHeight: 1, fontSize: '0.9rem',
                      }}
                    >
                      ⋮
                    </button>
                  </div>
                </div>

                {isMenuOpen && (
                  <FloatingMenu position={{ top: openMenu.top, right: openMenu.right }} onClose={() => setOpenMenu(null)}>
                    <DeckMenu kind="vocab" vocabId={v.id} />
                  </FloatingMenu>
                )}
              </motion.div>
            )
          })}
        </div>
      )}

    </div>
  )
}
