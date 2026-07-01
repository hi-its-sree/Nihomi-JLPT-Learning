import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'

const DECK = [
  { id: 1, front: '日本語',  read: 'にほんご',  back: 'Japanese language', example: '日本語を勉強しています。', level: 'N5' },
  { id: 2, front: 'こんにちは', read: 'こんにちは', back: 'Hello / Good afternoon', example: 'こんにちは！元気ですか？', level: 'N5' },
  { id: 3, front: '勉強',    read: 'べんきょう', back: 'Study',              example: '毎日勉強します。',       level: 'N5' },
  { id: 4, front: '電車',    read: 'でんしゃ',  back: 'Train',              example: '電車に乗ります。',       level: 'N5' },
  { id: 5, front: '図書館',   read: 'としょかん', back: 'Library',            example: '図書館で本を読む。',     level: 'N4' },
  { id: 6, front: '経験',    read: 'けいけん',  back: 'Experience',         example: '大切な経験です。',       level: 'N3' },
]

const SRS_BUTTONS = [
  { key: 'again', label: 'Again',     emoji: '↩', desc: '< 1 min', style: 'srs-btn-again' },
  { key: 'hard',  label: 'Hard',      emoji: '😓', desc: '6 min',   style: 'srs-btn-hard'  },
  { key: 'good',  label: 'Good',      emoji: '👍', desc: '10 min',  style: 'srs-btn-good'  },
  { key: 'easy',  label: 'Easy',      emoji: '✓',  desc: '4 days',  style: 'srs-btn-easy'  },
]

export default function FlashcardsPage() {
  const [index,   setIndex]   = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [history, setHistory] = useState([])
  const [done,    setDone]    = useState(false)

  const card = DECK[index]

  function rate(key) {
    setHistory(h => [...h, { card: card.id, rating: key }])
    setFlipped(false)
    if (index + 1 >= DECK.length) {
      setDone(true)
    } else {
      setIndex(i => i + 1)
    }
  }

  function restart() {
    setIndex(0)
    setFlipped(false)
    setHistory([])
    setDone(false)
  }

  if (done) {
    const counts = SRS_BUTTONS.reduce((acc, b) => {
      acc[b.key] = history.filter(h => h.rating === b.key).length
      return acc
    }, {})
    return (
      <div className="page-shell">
        <motion.div
          className="clay-card clay-card--lg"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          style={{ textAlign: 'center', maxWidth: 520, margin: '0 auto' }}
        >
          <div style={{ fontSize: '3rem', marginBottom: 12 }}>🎉</div>
          <h2 className="section-title" style={{ fontSize: '1.5rem' }}>Session Complete!</h2>
          <p style={{ color: 'var(--muted-plum)', marginTop: 8, lineHeight: 1.6 }}>
            You reviewed {DECK.length} cards. Here's your performance:
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, margin: '20px 0' }}>
            {SRS_BUTTONS.map(b => (
              <div key={b.key} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                <div style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--dark-ink)' }}>{counts[b.key] ?? 0}</div>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--muted-plum)' }}>{b.label}</div>
              </div>
            ))}
          </div>
          <div className="notice notice-green">
            Great work! Your next review session is scheduled based on your ratings.
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 20, flexWrap: 'wrap' }}>
            <button className="primary-btn" onClick={restart}>Review Again</button>
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
            {index + 1} / {DECK.length}
          </span>
          <Link to="/practice" className="ghost-btn btn-sm">← Practice</Link>
        </div>
      </div>

      {/* Progress bar */}
      <div className="progress-bar-wrap">
        <motion.div
          className="progress-bar-fill"
          animate={{ width: `${((index) / DECK.length) * 100}%` }}
          transition={{ duration: 0.4 }}
        />
      </div>

      {/* Flashcard */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24 }}>

        <div
          className="flashcard-scene"
          onClick={() => setFlipped(f => !f)}
          role="button"
          tabIndex={0}
          onKeyDown={e => e.key === 'Enter' && setFlipped(f => !f)}
          style={{ cursor: 'pointer' }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={`${index}-${flipped}`}
              className={`flashcard-inner ${flipped ? 'flipped' : ''}`}
              initial={{ rotateY: flipped ? -180 : 0 }}
              animate={{ rotateY: flipped ? 0 : 0 }}
              style={{ transformStyle: 'preserve-3d' }}
            >
              {!flipped ? (
                <div className="flashcard-face flashcard-front">
                  <div>
                    <div className="flashcard-char">{card.front}</div>
                    <div className="flashcard-reading">{card.read}</div>
                    <div className="flashcard-hint">Tap to reveal</div>
                  </div>
                </div>
              ) : (
                <div className="flashcard-face flashcard-back">
                  <div>
                    <div className="flashcard-meaning">{card.back}</div>
                    <div className="flashcard-hint" style={{ marginTop: 12, fontSize: '0.85rem', color: 'var(--dark-ink)' }}>
                      {card.example}
                    </div>
                    <div style={{ marginTop: 8 }}>
                      <span className={`badge badge-${card.level.toLowerCase()}`}>{card.level}</span>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

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
              {SRS_BUTTONS.map(b => (
                <div key={b.key} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                  <button className={`srs-btn ${b.style}`} onClick={() => rate(b.key)}>
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
          <div style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--dark-ink)', marginTop: 2 }}>N5 Core Vocabulary</div>
        </div>
        <div>
          <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--muted-plum)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Remaining</span>
          <div style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--dark-ink)', marginTop: 2 }}>{DECK.length - index} cards</div>
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
