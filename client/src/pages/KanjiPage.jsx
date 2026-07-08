import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Link, useParams } from 'react-router-dom'
import api from '../lib/api'

const LEVELS = ['All', 'N5', 'N4', 'N3', 'N2', 'N1']
const LEVEL_RE = /^N[1-5]$/i

const LEVEL_META = {
  N5: { title: 'N5 Beginner Kanji',           color: '#059669', total: 103 },
  N4: { title: 'N4 Elementary Kanji',         color: '#0284c7', total: 181 },
  N3: { title: 'N3 Intermediate Kanji',       color: '#7c3aed', total: 367 },
  N2: { title: 'N2 Upper-Intermediate Kanji', color: '#b45309', total: 367 },
  N1: { title: 'N1 Advanced Kanji',           color: '#be123c', total: 1118 },
}

export default function KanjiPage() {
  const { levelOrId } = useParams()

  const levelParam = levelOrId && LEVEL_RE.test(levelOrId) ? levelOrId.toUpperCase() : null

  const [activeLevel, setActiveLevel] = useState(levelParam ?? 'All')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [kanji, setKanji] = useState([])
  const [pagination, setPagination] = useState({ total: 0, page: 1, totalPages: 1, hasNextPage: false, hasPrevPage: false })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const effectiveLevel = levelParam ?? activeLevel
  const meta = levelParam ? LEVEL_META[levelParam] : null

  const getNormalizedKanjiLevel = (value) => {
    const rawLevel = String(value || '').trim().toUpperCase()
    if (rawLevel === '1') return 'N1'
    if (rawLevel === '2') return 'N2'
    if (rawLevel === '3') return 'N3'
    if (rawLevel === '4') return 'N4'
    if (rawLevel === 'OTHER' || rawLevel === '5') return 'N5'
    return rawLevel
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
          const rawLevel = String(item.level || 'OTHER').trim().toUpperCase()
          let normalizedLevel = rawLevel

          if (rawLevel === '1') normalizedLevel = 'N1'
          else if (rawLevel === '2') normalizedLevel = 'N2'
          else if (rawLevel === '3') normalizedLevel = 'N3'
          else if (rawLevel === '4') normalizedLevel = 'N4'
          else if (rawLevel === 'OTHER' || rawLevel === '5') normalizedLevel = 'N5'

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
          <Link to="/flashcards" className="secondary-btn">SRS Review →</Link>
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
              {l}
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
              const badgeLevel = k.level && k.level !== 'OTHER' ? k.level : 'N5'

              return (
                <motion.div
                  key={k.character}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.03, duration: 0.3 }}
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
