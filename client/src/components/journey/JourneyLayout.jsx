import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useJourney } from '../../contexts/JourneyContext'
import { TOTAL_JOURNEY_XP } from '../../pages/journey/content/chapters'

const FLOATING_KANJI = ['旅', '初', '学', '夢', '歩', '友', '道', '力']

export default function JourneyLayout({ children }) {
  const { state, skipJourney } = useJourney()
  const navigate = useNavigate()

  const overallPct = Math.round((state.xp / TOTAL_JOURNEY_XP) * 100)
  const showSkip = !state.hasCompletedJourney && !state.hasSkippedJourney

  async function handleSkip() {
    await skipJourney()
    navigate('/dashboard')
  }

  return (
    <div className="journey-shell" style={{ position: 'relative', overflow: 'hidden', minHeight: '100vh' }}>
      {FLOATING_KANJI.map((k, i) => (
        <motion.span key={k} aria-hidden="true"
          style={{
            position: 'fixed', pointerEvents: 'none', userSelect: 'none', zIndex: 0,
            top: `${8 + (i * 11) % 80}%`,
            left: i % 2 === 0 ? `${1 + (i * 6) % 8}%` : `${89 + (i * 3) % 9}%`,
            fontSize: `${3 + (i % 3) * 1.6}rem`, fontWeight: 900,
            color: 'var(--dark-ink)', opacity: 0.022,
          }}
          animate={{ y: [0, -18, 0], opacity: [0.022, 0.04, 0.022] }}
          transition={{ duration: 7 + i * 1.1, repeat: Infinity, delay: i * 0.6, ease: 'easeInOut' }}
        >
          {k}
        </motion.span>
      ))}

      <motion.header
        initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}
        className="journey-topbar"
      >
        <div className="journey-topbar-brand" onClick={() => navigate('/beginners-guide')}>
          <span style={{ fontSize: '1.3rem' }}>語</span>
          <span>Beginner Journey</span>
        </div>

        <div className="journey-topbar-progress">
          <div className="progress-bar-wrap" style={{ width: 140, height: 8 }}>
            <motion.div className="progress-bar-fill"
              initial={{ width: 0 }} animate={{ width: `${Math.min(100, overallPct)}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            />
          </div>
          <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--muted-plum)' }}>{overallPct}%</span>
        </div>

        <div className="journey-topbar-actions">
          <span className="journey-xp-pill">✦ {state.xp} XP</span>
          {showSkip ? (
            <button className="ghost-btn btn-sm" onClick={handleSkip}>Skip for now</button>
          ) : (
            <button className="ghost-btn btn-sm" onClick={() => navigate('/dashboard')}>Exit to Dashboard</button>
          )}
        </div>
      </motion.header>

      <main style={{ position: 'relative', zIndex: 1 }}>
        {children}
      </main>
    </div>
  )
}
