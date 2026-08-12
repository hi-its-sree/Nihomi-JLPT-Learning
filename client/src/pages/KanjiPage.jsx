import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Link, useParams } from 'react-router-dom'
import api from '../lib/api'
import DeckMenu from '../components/DeckMenu'
import FloatingMenu from '../components/FloatingMenu'

const LEVELS = ['All', 'N5', 'N4', 'N3', 'N2', 'N1', 'Other']
const LEVEL_RE = /^(N[1-5]|OTHER)$/i

const LEVEL_META = {
  N5: { title: 'N5 Beginner Kanji',           color: '#059669', total: 103 },
  OTHER: { title: 'Other Level Kanji',       color: '#6b7280', total: 0 },
  N4: { title: 'N4 Elementary Kanji',         color: '#0284c7', total: 181 },
  N3: { title: 'N3 Intermediate Kanji',       color: '#7c3aed', total: 367 },
  N2: { title: 'N2 Upper-Intermediate Kanji', color: '#b45309', total: 367 },
  N1: { title: 'N1 Advanced Kanji',           color: '#be123c', total: 1118 },
}

export default function KanjiPage() {
  const { levelOrId } = useParams()

  const normalizeLevelFilterValue = (value) => {
    if (!value || value === 'All') return 'All'
    const normalized = String(value).trim().toUpperCase()
    return normalized === 'OTHER' ? 'OTHER' : normalized
  }

  const levelParam = levelOrId && LEVEL_RE.test(levelOrId) ? levelOrId.toUpperCase() : null

  const [activeLevel, setActiveLevel] = useState(() => normalizeLevelFilterValue(levelParam ?? 'All'))
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [kanji, setKanji] = useState([])
  const [pagination, setPagination] = useState({ total: 0, page: 1, totalPages: 1, hasNextPage: false, hasPrevPage: false })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [flashcardIds, setFlashcardIds] = useState(() => new Set())
  const [openMenu, setOpenMenu] = useState(null) // { character, top, right } | null

  const effectiveLevel = normalizeLevelFilterValue(levelParam ?? activeLevel)
  const meta = levelParam ? LEVEL_META[levelParam] : null

  const getNormalizedKanjiLevel = (value) => {
    const rawLevel = String(value || '').trim().toUpperCase()

    switch (rawLevel) {
      case '1':
        return 'N1'
      case '2':
        return 'N2'
      case '3':
        return 'N3'
      case '4':
        return 'N4'
      case '5':
        return 'N5'
      case 'OTHER':
        return 'OTHER'
      default:
        return rawLevel
    }
  }

  const filteredKanji = kanji.filter((item) => {
    if (effectiveLevel === 'All') return true

    const normalizedLevel = getNormalizedKanjiLevel(item.level)
    return normalizedLevel === effectiveLevel
  })

  useEffect(() => {
    let mounted = true

    const fetchKanji = async () => {
      setLoading(true)
      setError('')

      try {
        const params = {
          page,
          limit: 100,
          sortBy: effectiveLevel === 'All' ? 'level' : 'character',
          sortOrder: 'asc',
        }

        if (search.trim()) params.q = search.trim()
        if (effectiveLevel !== 'All') params.level = effectiveLevel

        const response = await api.get('/api/kanji', { params })
        if (!mounted) return

        const payload = Array.isArray(response.data?.data) ? response.data.data : []
        const normalized = payload.map((item) => {
          const normalizedLevel = getNormalizedKanjiLevel(item.level)

          return {
            ...item,
            character: item.character || item.char || item.kanji || '—',
            meaning: item.meaning || item.meanings || '—',
            level: normalizedLevel,
            onReadings: Array.isArray(item.onReadings) ? item.onReadings : [],
            kunReadings: Array.isArray(item.kunReadings) ? item.kunReadings : [],
            strokeCount: item.strokeCount ?? item.strokes ?? 0,
          }
        })

        setKanji(normalized)
        setPagination(response.data?.pagination ?? { total: normalized.length })
      } catch (err) {
        if (!mounted) return
        console.error('Failed to load kanji from API', err)
        // Surface useful error text where available so users can see what failed
        const apiMessage = err?.response?.data?.message
        const errMsg = apiMessage || err?.message || 'Unable to load kanji right now. Please try again in a moment.'
        setError(errMsg)
      } finally {
        if (mounted) setLoading(false)
      }
    }

    fetchKanji()
    return () => {
      mounted = false
    }
  }, [effectiveLevel, search, page])

  useEffect(() => {
    setPage(1)
  }, [effectiveLevel, search])

  useEffect(() => {
    let mounted = true
    api.get('/api/v1/flashcards/kanji-ids')
      .then(({ data }) => {
        if (!mounted) return
        setFlashcardIds(new Set(data.kanjiIds || []))
      })
      .catch(() => {})
    return () => { mounted = false }
  }, [])

  function handleMembershipChange(kanjiId, hasAny) {
    setFlashcardIds(prev => {
      const next = new Set(prev)
      if (hasAny) next.add(kanjiId)
      else next.delete(kanjiId)
      return next
    })
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
          <Link to="/kanji" className="ghost-btn btn-sm" style={{ marginBottom: 12, display: 'inline-flex' }}>
            ← All Kanji
          </Link>
        )}
        <p className="eyebrow">Kanji Library</p>
        <h1 className="page-title" style={{ marginTop: 8 }}>
          {meta ? meta.title : 'Explore Kanji'}
        </h1>
        <p className="page-subtitle" style={{ marginTop: 10 }}>
          {meta
            ? `${meta.total.toLocaleString()} kanji at ${levelParam} level. Tap any card to study stroke order and readings.`
            : 'Study stroke order, readings, and meanings. Tap any kanji to open its full detail page.'}
        </p>
        <div style={{ marginTop: 16, display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          <input
            className="field-input"
            placeholder="Search kanji, meaning, or reading…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ flex: '1 1 240px', maxWidth: 360 }}
          />
          <Link to={`/flashcards?type=kanji&level=${effectiveLevel === 'All' ? 'N5' : effectiveLevel}`} className="secondary-btn">SRS Review →</Link>
          <Link to={`/stroke-practice?level=${effectiveLevel === 'All' ? 'N5' : effectiveLevel}&mode=trace`} className="primary-btn">✍ Stroke Practice →</Link>
        </div>
      </motion.div>

      {/* Level filter pills — general mode only */}
      {!levelParam && (
        <motion.div
          className="filter-bar"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {LEVELS.map(l => (
            <button
              key={l}
              className={`filter-pill ${activeLevel === l ? 'active' : ''}`}
              onClick={() => setActiveLevel(l)}
            >
              {l === 'Other' ? 'Other • misc' : l}
            </button>
          ))}
          <span style={{ marginLeft: 'auto', fontSize: '0.82rem', color: 'var(--muted-plum)', fontWeight: 600 }}>
            {pagination.total || filteredKanji.length} kanji
          </span>
        </motion.div>
      )}

      {/* Level badge — level-specific mode */}
      {levelParam && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          style={{ display: 'flex', alignItems: 'center', gap: 10 }}
        >
          <span
            className="filter-pill active"
            style={{ background: meta?.color, color: '#fff', border: 'none' }}
          >
            {levelParam}
          </span>
          <span style={{ fontSize: '0.82rem', color: 'var(--muted-plum)', fontWeight: 600 }}>
            {filteredKanji.length} kanji shown
          </span>
        </motion.div>
      )}

      {loading && (
        <div style={{ textAlign: 'center', padding: '40px 24px', color: 'var(--muted-plum)' }}>
          Loading kanji from the database…
        </div>
      )}

      {!loading && error && (
        <div style={{ textAlign: 'center', padding: '40px 24px', color: 'var(--muted-plum)' }}>
          <div style={{ fontSize: '3rem', marginBottom: 12 }}>字</div>
          <p style={{ fontWeight: 600 }}>{error}</p>
        </div>
      )}

      {!loading && !error && (
        <>
          <div className="kanji-grid">
            {filteredKanji.map((k, i) => {
              const readings = [k.onReadings, k.kunReadings].flat().filter(Boolean)
              const previewReading = readings[0] || '—'
              const meaning = k.meaning || '—'
              const badgeLevel = k.level || 'N5'

              const isAdded = flashcardIds.has(k.id)
              const isMenuOpen = openMenu?.character === k.character

              return (
                <motion.div
                  key={k.character}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.03, duration: 0.3 }}
                  style={{ position: 'relative' }}
                >
                  <Link to={`/kanji-detail/${encodeURIComponent(k.character)}`} className="kanji-card">
                    <div className="kanji-char">{k.character}</div>
                    <div className="kanji-reading">{previewReading}</div>
                    <div className="kanji-meaning">{meaning}</div>
                    <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginTop: 4, flexWrap: 'wrap', width: '100%' }}>
                      <span className={`badge badge-${badgeLevel.toLowerCase()}`}>{badgeLevel}</span>
                      <span style={{ fontSize: '0.68rem', color: 'var(--muted-plum)', fontWeight: 600 }}>{k.strokeCount || 0} strokes</span>
                    </div>
                  </Link>

                  <div style={{ position: 'absolute', top: 8, right: 8 }}>
                    <button
                      type="button"
                      aria-label="Flashcard actions"
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        if (isMenuOpen) {
                          setOpenMenu(null)
                          return
                        }
                        const rect = e.currentTarget.getBoundingClientRect()
                        setOpenMenu({ character: k.character, top: rect.bottom + 6, right: window.innerWidth - rect.right })
                      }}
                      style={{
                        width: 24, height: 24, borderRadius: '50%', border: 'none',
                        background: isAdded ? 'var(--terracotta)' : 'rgba(255,255,255,0.85)',
                        color: isAdded ? '#fff' : 'var(--muted-plum)',
                        cursor: 'pointer', fontWeight: 900, lineHeight: 1, fontSize: '0.9rem',
                      }}
                    >
                      ⋮
                    </button>

                    {isMenuOpen && (
                      <FloatingMenu position={{ top: openMenu.top, right: openMenu.right }} onClose={() => setOpenMenu(null)}>
                        <DeckMenu kanjiId={k.id} onMembershipChange={(hasAny) => handleMembershipChange(k.id, hasAny)} />
                      </FloatingMenu>
                    )}
                  </div>
                </motion.div>
              )
            })}
          </div>

          {filteredKanji.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px 24px', color: 'var(--muted-plum)' }}>
              <div style={{ fontSize: '3rem', marginBottom: 12 }}>字</div>
              <p style={{ fontWeight: 600 }}>
                {search.trim()
                  ? 'No kanji match your search. Try a different term.'
                  : 'No kanji found for this level or page. Try a different filter.'}
              </p>
            </div>
          )}

          {(pagination.totalPages > 1 || pagination.hasPrevPage || pagination.hasNextPage) && filteredKanji.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 24, gap: 12 }}>
              <div style={{ color: 'var(--muted-plum)', fontSize: '0.9rem' }}>
                Page {page} of {pagination.totalPages} · {pagination.total.toLocaleString()} kanji
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  className="secondary-btn"
                  onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                  disabled={!pagination.hasPrevPage}
                >
                  Previous
                </button>
                <button
                  className="primary-btn"
                  onClick={() => setPage((prev) => Math.min(prev + 1, pagination.totalPages))}
                  disabled={!pagination.hasNextPage}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}

    </div>
  )
}
