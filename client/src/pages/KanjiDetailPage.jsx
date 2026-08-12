import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Link, useParams } from 'react-router-dom'
import api from '../lib/api'
import { getKanjiStrokePaths } from '../lib/kanjiStrokeData.mjs'
import DeckMenu from '../components/DeckMenu'
import FloatingMenu from '../components/FloatingMenu'
import StrokeOrderPlayer from '../components/StrokeOrderPlayer'

export default function KanjiDetailPage() {
  const { kanjiId } = useParams()
  const char = kanjiId ? decodeURIComponent(kanjiId) : '日'
  const [kanji, setKanji] = useState(null)
  const [strokePaths, setStrokePaths] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [inFlashcards, setInFlashcards] = useState(false)
  const [deckMenuPos, setDeckMenuPos] = useState(null) // { top, left } | null

  useEffect(() => {
    let mounted = true

    const fetchKanji = async () => {
      setLoading(true)
      setError('')
      setStrokePaths([])
      setInFlashcards(false)
      setDeckMenuPos(null)

      try {
        const response = await api.get(`/api/kanji/${encodeURIComponent(char)}`)
        if (!mounted) return

        const kanjiData = response.data?.data ?? null
        setKanji(kanjiData)

        const paths = await getKanjiStrokePaths(char, kanjiData?.strokeCount || 0)
        if (!mounted) return
        setStrokePaths(paths)

        if (kanjiData?.id) {
          try {
            const { data } = await api.get('/api/v1/flashcards/kanji-ids')
            if (!mounted) return
            setInFlashcards((data.kanjiIds || []).includes(kanjiData.id))
          } catch {
            // Non-critical — the add button just falls back to "not added" state.
          }
        }
      } catch (err) {
        if (!mounted) return
        console.error('Failed to load kanji details', err)
        setError('Unable to load this kanji right now.')
      } finally {
        if (mounted) setLoading(false)
      }
    }

    fetchKanji()
    return () => {
      mounted = false
    }
  }, [char])

  function openDeckMenu(e) {
    e.stopPropagation()
    if (deckMenuPos) {
      setDeckMenuPos(null)
      return
    }
    const rect = e.currentTarget.getBoundingClientRect()
    setDeckMenuPos({ top: rect.bottom + 6, left: rect.left })
  }

  const info = kanji
    ? {
        meaning: kanji.meaning || '—',
        on: (kanji.onReadings || []).join('・') || '—',
        kun: (kanji.kunReadings || []).join('・') || '—',
        level: kanji.level || 'N5',
        strokes: kanji.strokeCount || 0,
        examples: [],
      }
    : { meaning: 'Kanji', on: '—', kun: '—', level: 'N5', strokes: 0, examples: [] }

  return (
    <div className="page-shell">

      {/* Back nav */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <Link to="/kanji" className="ghost-btn btn-sm">← Back to Kanji</Link>
        <Link to="/flashcards" className="ghost-btn btn-sm">Review Flashcards →</Link>
      </div>

      {/* Hero row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 24, alignItems: 'start', flexWrap: 'wrap' }}>

        {/* Large character */}
        <motion.div
          className="clay-card"
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          style={{ textAlign: 'center', padding: 32, minWidth: 180 }}
        >
          <motion.div
            className="kanji-hero-char"
            animate={{ textShadow: ['0 0 0px transparent', '0 0 30px rgba(201,122,74,0.3)', '0 0 0px transparent'] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            {char}
          </motion.div>
          <div style={{ marginTop: 12 }}>
            <span className={`badge badge-${info.level.toLowerCase()}`}>{info.level}</span>
          </div>
          <div style={{ marginTop: 8, fontSize: '0.78rem', color: 'var(--muted-plum)', fontWeight: 600 }}>
            {loading ? 'Loading…' : `${info.strokes} strokes`}
          </div>
        </motion.div>

        {/* Info card */}
        <motion.div
          className="clay-card"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.15, duration: 0.5 }}
        >
          <p className="eyebrow">Character detail</p>
          <h1 className="page-title" style={{ marginTop: 6, fontSize: '1.6rem' }}>{info.meaning}</h1>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 16 }}>
            <div>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--muted-plum)', marginBottom: 4 }}>On reading (音読み)</div>
              <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--dark-ink)' }}>{info.on}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--muted-plum)', marginBottom: 4 }}>Kun reading (訓読み)</div>
              <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--dark-ink)' }}>{info.kun}</div>
            </div>
          </div>

          {!loading && !error && info.examples.length > 0 && (
            <div style={{ marginTop: 20 }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--muted-plum)', marginBottom: 10 }}>Example words</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {info.examples.map(ex => (
                  <div key={ex.jp} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', borderRadius: 12, background: 'rgba(255,255,255,0.65)', border: '1px solid rgba(255,255,255,0.7)' }}>
                    <span style={{ fontSize: '1.1rem', fontWeight: 900, color: 'var(--dark-ink)', minWidth: 60 }}>{ex.jp}</span>
                    <span style={{ fontSize: '0.82rem', color: 'var(--terracotta)', fontWeight: 700 }}>{ex.read}</span>
                    <span style={{ fontSize: '0.82rem', color: 'var(--muted-plum)' }}>{ex.en}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {!loading && error && (
            <div style={{ marginTop: 20, color: 'var(--muted-plum)', fontWeight: 600 }}>{error}</div>
          )}

          <div style={{ display: 'flex', gap: 10, marginTop: 20, flexWrap: 'wrap', alignItems: 'center' }}>
            <Link to="/practice" className="primary-btn">Practice Now</Link>

            <div>
              <button
                type="button"
                className="secondary-btn"
                disabled={!kanji}
                onClick={openDeckMenu}
              >
                {inFlashcards ? '✓ In Flashcards' : 'Add to Flashcards'} ▾
              </button>

              {deckMenuPos && kanji && (
                <FloatingMenu position={deckMenuPos} onClose={() => setDeckMenuPos(null)}>
                  <DeckMenu kanjiId={kanji.id} onMembershipChange={setInFlashcards} />
                </FloatingMenu>
              )}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Stroke order player */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="section-title" style={{ marginBottom: 16 }}>Stroke Order Animation</div>
        <StrokeOrderPlayer strokes={strokePaths} />
      </motion.div>

      {/* Mnemonic / study tip */}
      <motion.div
        className="clay-card"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <div className="notice notice-gold" style={{ borderRadius: 16 }}>
          <strong>Study Tip</strong> — Associate {char} with its visual shape. The character resembles {info.meaning}, making it easier to remember at a glance. Practice writing it 5–10 times while saying the reading aloud.
        </div>
        <div style={{ marginTop: 16, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <Link to={`/kanji`} className="ghost-btn btn-sm">← Kanji list</Link>
          <Link to="/practice" className="secondary-btn btn-sm">Writing practice →</Link>
        </div>
      </motion.div>

    </div>
  )
}
