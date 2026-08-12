import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import api from '../lib/api'
import { useDecks } from '../hooks/useDecks'
import TextPromptModal from '../components/TextPromptModal'
import ConfirmModal from '../components/ConfirmModal'

const SRS_BUTTONS = [
  { key: 'again', label: 'Again',     emoji: '↩', desc: '1 day',   style: 'srs-btn-again' },
  { key: 'hard',  label: 'Hard',      emoji: '😓', desc: 'Sooner',  style: 'srs-btn-hard'  },
  { key: 'good',  label: 'Good',      emoji: '👍', desc: 'On track', style: 'srs-btn-good'  },
  { key: 'easy',  label: 'Easy',      emoji: '✓',  desc: 'Later',   style: 'srs-btn-easy'  },
]

const LEVELS = ['N5', 'N4', 'N3', 'N2', 'N1']

const DIRECTION_KEY = 'jlpt-flashcard-direction'
const DIRECTIONS = [
  { key: 'kanji-first',   label: 'Kanji first', desc: 'See the kanji, tap to reveal reading & meaning' },
  { key: 'meaning-first', label: 'Meaning first', desc: 'See the reading & meaning, tap to reveal the kanji' },
]

export default function FlashcardsPage() {
  const [deck,       setDeck]       = useState([])
  const [meta,        setMeta]       = useState({ due: 0, newCount: 0, level: '', deckName: '' })
  const [loading,     setLoading]    = useState(true)
  const [error,       setError]      = useState('')
  const [index,       setIndex]      = useState(0)
  const [flipped,     setFlipped]    = useState(false)
  const [history,     setHistory]    = useState([])
  const [done,        setDone]       = useState(false)
  const [submitting,  setSubmitting] = useState(false)
  const [activeLevel, setActiveLevel] = useState('N5')
  const [view,         setView]       = useState('level') // 'level' | 'collection' — the flashcards themselves come first
  const [collectionId, setCollectionId] = useState(null) // 'mine' | a deck id
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [renameTarget, setRenameTarget] = useState(null) // { id, name } | null
  const [deleteTarget, setDeleteTarget] = useState(null) // { id, name } | null
  const [direction, setDirection] = useState(() => {
    if (typeof window === 'undefined') return 'kanji-first'
    return window.localStorage.getItem(DIRECTION_KEY) || 'kanji-first'
  })
  const [settingsOpen, setSettingsOpen] = useState(false)

  const { decks, loading: decksLoading, createDeck, renameDeck, deleteDeck } = useDecks()

  useEffect(() => {
    window.localStorage.setItem(DIRECTION_KEY, direction)
  }, [direction])

  useEffect(() => {
    if (!settingsOpen) return
    const closeMenu = () => setSettingsOpen(false)
    document.addEventListener('click', closeMenu)
    return () => document.removeEventListener('click', closeMenu)
  }, [settingsOpen])

  function switchToFlashcards() {
    setView('level')
  }

  function switchToCollections() {
    setView('collection')
    if (!collectionId) setCollectionId('mine')
  }

  async function loadDeck() {
    if (view === 'collection' && !collectionId) {
      setDeck([])
      setLoading(false)
      return
    }

    setLoading(true)
    setError('')
    setIndex(0)
    setFlipped(false)
    setHistory([])
    setDone(false)
    try {
      let data
      if (view === 'collection' && collectionId === 'mine') {
        ({ data } = await api.get('/api/v1/flashcards', { params: { source: 'mine' } }))
      } else if (view === 'collection') {
        ({ data } = await api.get(`/api/v1/decks/${collectionId}/cards`))
      } else {
        ({ data } = await api.get('/api/v1/flashcards', { params: { source: 'level', level: activeLevel } }))
      }
      setDeck(data.deck ?? [])
      setMeta({ due: data.due ?? 0, newCount: data.newCount ?? 0, level: data.level ?? '', deckName: data.deckName ?? '' })
    } catch {
      setError('Unable to load your flashcard deck right now. Please try again.')
      setDeck([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDeck()
  }, [activeLevel, view, collectionId])

  async function handleCreateDeck(name) {
    const created = await createDeck(name)
    setCollectionId(created.id)
  }

  async function handleRenameDeck(nextName) {
    await renameDeck(renameTarget.id, nextName)
  }

  async function handleDeleteDeck() {
    await deleteDeck(deleteTarget.id)
    if (collectionId === deleteTarget.id) setCollectionId('mine')
  }

  const card = deck[index]

  function renderFilterBar() {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div className="filter-bar">
          <button
            className={`filter-pill ${view === 'level' ? 'active' : ''}`}
            onClick={switchToFlashcards}
          >
            Flashcards
          </button>
          <select
            className="field-input"
            value={activeLevel}
            onChange={(e) => { setActiveLevel(e.target.value); setView('level') }}
            style={{ padding: '7px 14px', fontSize: '0.82rem', fontWeight: 700, borderRadius: 999, width: 'auto' }}
          >
            {LEVELS.map(l => (
              <option key={l} value={l}>{l} Kanji</option>
            ))}
          </select>
          <button
            className={`filter-pill ${view === 'collection' ? 'active' : ''}`}
            onClick={switchToCollections}
          >
            📚 My Collections
          </button>
        </div>

        {view === 'collection' && (
          <div className="filter-bar" style={{ paddingTop: 4, borderTop: '1px dashed rgba(201,122,74,0.2)' }}>
            <button
              className={`filter-pill ${collectionId === 'mine' ? 'active' : ''}`}
              onClick={() => setCollectionId('mine')}
            >
              ★ My Flashcards
            </button>

            {decksLoading && <span style={{ fontSize: '0.82rem', color: 'var(--muted-plum)' }}>Loading your decks…</span>}
            {decks.map(d => (
              <div key={d.id} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <button
                  className={`filter-pill ${collectionId === d.id ? 'active' : ''}`}
                  onClick={() => setCollectionId(d.id)}
                >
                  {d.name} · {d.cardCount}
                </button>
                <button
                  type="button"
                  onClick={() => setRenameTarget({ id: d.id, name: d.name })}
                  title="Rename"
                  style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--muted-plum)', fontSize: '0.85rem' }}
                >
                  ✎
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteTarget({ id: d.id, name: d.name })}
                  title="Delete"
                  style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--muted-plum)', fontSize: '0.85rem' }}
                >
                  ✕
                </button>
              </div>
            ))}
            <button type="button" className="secondary-btn btn-sm" onClick={() => setCreateModalOpen(true)}>+ New Collection</button>
          </div>
        )}

        <TextPromptModal
          open={createModalOpen}
          title={decks.length === 0 ? 'Name your first collection' : 'Name your new collection'}
          subtitle={decks.length === 0 ? 'Group kanji your own way — you can add cards to it right after.' : undefined}
          submitLabel="Create collection"
          onSubmit={handleCreateDeck}
          onClose={() => setCreateModalOpen(false)}
        />

        <TextPromptModal
          open={Boolean(renameTarget)}
          title="Rename this collection"
          initialValue={renameTarget?.name || ''}
          submitLabel="Save name"
          onSubmit={handleRenameDeck}
          onClose={() => setRenameTarget(null)}
        />

        <ConfirmModal
          open={Boolean(deleteTarget)}
          title="Delete this collection?"
          message={`"${deleteTarget?.name}" will be removed. Cards keep their review progress and stay in your other collections.`}
          confirmLabel="Delete collection"
          onConfirm={handleDeleteDeck}
          onClose={() => setDeleteTarget(null)}
        />
      </div>
    )
  }

  async function rate(key) {
    if (!card || submitting) return
    setSubmitting(true)
    try {
      const { data } = await api.post(`/api/v1/flashcards/${encodeURIComponent(card.id)}/review`, { rating: key })
      setHistory((h) => [...h, { card: card.id, rating: key, xpGained: data.xpGained ?? 0 }])
      setFlipped(false)
      if (index + 1 >= deck.length) {
        setDone(true)
      } else {
        setIndex((i) => i + 1)
      }
    } catch {
      setError('Could not save that review — please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="page-shell">
        {renderFilterBar()}
        <div className="clay-card clay-card--lg" style={{ textAlign: 'center', color: 'var(--muted-plum)' }}>
          Loading your flashcard deck…
        </div>
      </div>
    )
  }

  if (!loading && deck.length === 0) {
    let emptyCopy
    if (view === 'level') {
      emptyCopy = { title: 'No kanji found for this level', body: 'Try a different level from the dropdown above.' }
    } else if (collectionId === 'mine') {
      emptyCopy = { title: 'No flashcards added yet', body: 'Cards you add from the Kanji pages show up here. Browse the Kanji library and use the ⋮ menu or the "Add to Flashcards" button to build your own set.' }
    } else if (collectionId) {
      emptyCopy = { title: 'This collection is empty', body: 'Add kanji to this collection from the Kanji pages using the "Collections" menu.' }
    } else {
      emptyCopy = { title: 'No collections yet', body: 'Create your first collection above, then add kanji to it from the Kanji pages using the "Collections" menu.' }
    }

    return (
      <div className="page-shell">
        {renderFilterBar()}
        <motion.div className="clay-card clay-card--lg" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          style={{ textAlign: 'center', maxWidth: 520, margin: '0 auto' }}>
          <div style={{ fontSize: '2.6rem', marginBottom: 12 }}>🎉</div>
          <h2 className="section-title" style={{ fontSize: '1.3rem' }}>{emptyCopy.title}</h2>
          <p style={{ color: 'var(--muted-plum)', marginTop: 8, lineHeight: 1.6 }}>
            {error || emptyCopy.body}
          </p>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 20, flexWrap: 'wrap' }}>
            <button className="primary-btn" onClick={loadDeck}>Check again</button>
            <Link to="/kanji" className="secondary-btn">Browse Kanji →</Link>
          </div>
        </motion.div>
      </div>
    )
  }

  if (done) {
    const counts = SRS_BUTTONS.reduce((acc, b) => {
      acc[b.key] = history.filter((h) => h.rating === b.key).length
      return acc
    }, {})
    const totalXp = history.reduce((sum, h) => sum + (h.xpGained || 0), 0)
    return (
      <div className="page-shell">
        {renderFilterBar()}
        <motion.div
          className="clay-card clay-card--lg"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          style={{ textAlign: 'center', maxWidth: 520, margin: '0 auto' }}
        >
          <div style={{ fontSize: '3rem', marginBottom: 12 }}>🎉</div>
          <h2 className="section-title" style={{ fontSize: '1.5rem' }}>Session Complete!</h2>
          <p style={{ color: 'var(--muted-plum)', marginTop: 8, lineHeight: 1.6 }}>
            You reviewed {deck.length} cards and earned {totalXp} XP. Here's your performance:
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, margin: '20px 0' }}>
            {SRS_BUTTONS.map((b) => (
              <div key={b.key} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                <div style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--dark-ink)' }}>{counts[b.key] ?? 0}</div>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--muted-plum)' }}>{b.label}</div>
              </div>
            ))}
          </div>
          <div className="notice notice-green">
            Great work! Your next review for each card is scheduled based on your ratings.
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 20, flexWrap: 'wrap' }}>
            <button className="primary-btn" onClick={loadDeck}>Review More Cards</button>
            <Link to="/practice" className="secondary-btn">Back to Practice</Link>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="page-shell">

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <p className="eyebrow">Flashcard SRS</p>
          <h1 className="page-title" style={{ marginTop: 4, fontSize: '1.6rem' }}>Spaced Repetition Review</h1>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--muted-plum)' }}>
            {index + 1} / {deck.length}
          </span>
          <div style={{ position: 'relative' }}>
            <button
              type="button"
              className="ghost-btn btn-sm"
              onClick={(e) => { e.stopPropagation(); setSettingsOpen((open) => !open) }}
            >
              ⚙ Card order
            </button>
            {settingsOpen && (
              <div
                onClick={(e) => e.stopPropagation()}
                style={{
                  position: 'absolute', top: '110%', right: 0, background: '#fff',
                  border: '1px solid rgba(0,0,0,0.08)', borderRadius: 10,
                  boxShadow: '0 8px 24px rgba(0,0,0,0.15)', zIndex: 20, minWidth: 260, padding: 8,
                }}
              >
                {DIRECTIONS.map((d) => (
                  <label
                    key={d.key}
                    style={{ display: 'flex', gap: 8, alignItems: 'flex-start', padding: '8px 6px', cursor: 'pointer' }}
                  >
                    <input
                      type="radio"
                      name="flashcard-direction"
                      checked={direction === d.key}
                      onChange={() => { setDirection(d.key); setFlipped(false) }}
                      style={{ marginTop: 3 }}
                    />
                    <span>
                      <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--dark-ink)' }}>{d.label}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--muted-plum)' }}>{d.desc}</div>
                    </span>
                  </label>
                ))}
              </div>
            )}
          </div>
          <Link to="/practice" className="ghost-btn btn-sm">← Practice</Link>
        </div>
      </div>

      {renderFilterBar()}

      {error && (
        <div className="clay-card" style={{ padding: '12px 16px', color: 'var(--muted-plum)' }}>{error}</div>
      )}

      {/* Progress bar */}
      <div className="progress-bar-wrap">
        <motion.div
          className="progress-bar-fill"
          animate={{ width: `${(index / deck.length) * 100}%` }}
          transition={{ duration: 0.4 }}
        />
      </div>

      {/* Flashcard */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24 }}>

        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            className="flashcard-scene"
            onClick={() => setFlipped((f) => !f)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && setFlipped((f) => !f)}
            style={{ cursor: 'pointer' }}
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.2 }}
          >
            {/* Both faces render at once — the .flipped class on flashcard-inner
                (App.css) drives the 3D rotation via CSS, not via JS/inline styles.
                Conditionally rendering only one face here previously fought with
                that CSS transform and made the back face disappear on flip. */}
            <div className={`flashcard-inner ${flipped ? 'flipped' : ''}`}>
              <div className="flashcard-face flashcard-front">
                <div>
                  {direction === 'kanji-first' ? (
                    <div className="flashcard-char">{card.front}</div>
                  ) : (
                    <>
                      <div className="flashcard-reading">{card.frontReading}</div>
                      <div className="flashcard-meaning">{card.back}</div>
                    </>
                  )}
                  <div className="flashcard-hint">Tap to reveal</div>
                </div>
              </div>
              <div className="flashcard-face flashcard-back">
                <div>
                  {direction === 'kanji-first' ? (
                    <>
                      <div className="flashcard-reading">{card.frontReading}</div>
                      <div className="flashcard-meaning">{card.back}</div>
                    </>
                  ) : (
                    <div className="flashcard-char">{card.front}</div>
                  )}
                  {card.example && (
                    <div className="flashcard-hint" style={{ marginTop: 12, fontSize: '0.85rem', color: 'var(--dark-ink)' }}>
                      {card.example}
                    </div>
                  )}
                  <div style={{ marginTop: 8 }}>
                    <span className={`badge badge-${card.level.toLowerCase()}`}>{card.level}</span>
                    {card.isNew && (
                      <span className="badge" style={{ marginLeft: 6, background: 'rgba(2,132,199,0.12)', color: '#0284c7' }}>New</span>
                    )}
                    {card.addedManually && (
                      <span className="badge" style={{ marginLeft: 6, background: 'rgba(201,122,74,0.15)', color: 'var(--terracotta)' }}>★ Added by you</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {!flipped && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ fontSize: '0.82rem', color: 'var(--muted-plum)', textAlign: 'center' }}
          >
            Think of the meaning, then tap the card to check.
          </motion.p>
        )}

        {/* SRS rating buttons — only show after flip */}
        <AnimatePresence>
          {flipped && (
            <motion.div
              className="flashcard-actions"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              {SRS_BUTTONS.map((b) => (
                <div key={b.key} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                  <button className={`srs-btn ${b.style}`} onClick={() => rate(b.key)} disabled={submitting}>
                    {b.emoji} {b.label}
                  </button>
                  <span style={{ fontSize: '0.68rem', color: 'var(--muted-plum)' }}>{b.desc}</span>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Session info */}
      <motion.div
        className="clay-card clay-card--sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        style={{ display: 'flex', gap: 20, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}
      >
        <div>
          <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--muted-plum)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Deck</span>
          <div style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--dark-ink)', marginTop: 2 }}>
            {view === 'level' && `${meta.level} Kanji`}
            {view === 'collection' && collectionId === 'mine' && 'My Flashcards'}
            {view === 'collection' && collectionId && collectionId !== 'mine' && (meta.deckName || 'Collection')}
          </div>
        </div>
        <div>
          <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--muted-plum)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Remaining</span>
          <div style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--dark-ink)', marginTop: 2 }}>{deck.length - index} cards</div>
        </div>
        <div>
          <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--muted-plum)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Reviewed</span>
          <div style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--dark-ink)', marginTop: 2 }}>{index} cards</div>
        </div>
        <Link to="/progress" className="ghost-btn btn-sm">View SRS stats →</Link>
      </motion.div>

    </div>
  )
}
