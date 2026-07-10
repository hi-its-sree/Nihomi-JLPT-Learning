import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useJourney } from '../contexts/JourneyContext'
import ChapterMap from '../components/journey/ChapterMap'
import { CHAPTER_ORDER, TOTAL_JOURNEY_XP } from './journey/content/chapters'

export default function BeginnersGuidePage() {
  const { state, loading } = useJourney()

  const chaptersComplete = state.completedChapters.length
  const overallPct = Math.min(100, Math.round((state.xp / TOTAL_JOURNEY_XP) * 100))

  return (
    <div className="journey-content-wrap">
      <motion.div className="clay-card clay-card--lg"
        initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55 }}
        style={{ position: 'relative', overflow: 'hidden' }}
      >
        <motion.p className="eyebrow" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}>
          Beginner Journey
        </motion.p>
        <motion.h1 className="page-title" style={{ marginTop: 8 }} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          Welcome to Your Japanese Journey
        </motion.h1>
        <motion.p className="page-subtitle" style={{ marginTop: 10 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}>
          Before N5, let's build your confidence. Ten short chapters — land in Japan, meet your first characters,
          have your first conversations — designed to make Japanese feel exciting, not intimidating.
        </motion.p>

        <motion.div style={{ display: 'flex', gap: 28, marginTop: 22, flexWrap: 'wrap' }}
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}>
          {[
            { label: 'Chapters Complete', val: `${chaptersComplete} / ${CHAPTER_ORDER.length}`, color: '#059669' },
            { label: 'Badges Unlocked', val: state.badges.length, color: '#7c3aed' },
            { label: 'XP Earned', val: state.xp.toLocaleString(), color: '#b45309' },
            { label: 'Journey Progress', val: `${overallPct}%`, color: 'var(--terracotta)' },
          ].map((s) => (
            <div key={s.label}>
              <div style={{ fontSize: '1.5rem', fontWeight: 900, color: s.color, lineHeight: 1 }}>{s.val}</div>
              <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--muted-plum)', textTransform: 'uppercase', letterSpacing: '0.07em', marginTop: 3 }}>{s.label}</div>
            </div>
          ))}
        </motion.div>

        <motion.div style={{ marginTop: 22 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.55 }}>
          <div className="progress-bar-wrap" style={{ height: 10, borderRadius: 999 }}>
            <motion.div style={{ height: '100%', borderRadius: 999, background: 'linear-gradient(90deg, #c97a4a 0%, #059669 25%, #0284c7 50%, #7c3aed 75%, #be123c 100%)' }}
              initial={{ width: 0 }} animate={{ width: `${overallPct}%` }}
              transition={{ duration: 1.4, ease: 'easeOut', delay: 0.65 }}
            />
          </div>
        </motion.div>

        <span style={{ position: 'absolute', right: 28, top: '50%', transform: 'translateY(-50%)', fontSize: '8rem', fontWeight: 900, color: 'rgba(201,122,74,0.045)', pointerEvents: 'none', userSelect: 'none' }}>旅</span>
      </motion.div>

      {!loading && (
        <>
          <ChapterMap journeyState={state} />

          <motion.div className="clay-card" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            style={{ textAlign: 'center' }}>
            {state.hasCompletedJourney ? (
              <>
                <motion.div style={{ fontSize: '2.5rem', marginBottom: 10 }}
                  animate={{ rotate: [0, 6, -6, 0] }} transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}>
                  🎉
                </motion.div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--dark-ink)', marginBottom: 8 }}>
                  You've completed the Beginner Journey!
                </h2>
                <p style={{ color: 'var(--muted-plum)', fontSize: '0.88rem', lineHeight: 1.75, maxWidth: 500, margin: '0 auto 20px' }}>
                  {state.xp.toLocaleString()} XP earned, {state.badges.length} badges unlocked. Time to start N5 for real.
                </p>
                <Link to="/levels/N5" className="primary-btn">Continue to N5 →</Link>
              </>
            ) : (
              <>
                <motion.div style={{ fontSize: '2.5rem', marginBottom: 10 }}
                  animate={{ y: [0, -8, 0] }} transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}>
                  ✈️
                </motion.div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--dark-ink)', marginBottom: 8 }}>
                  Every journey starts with a single step
                </h2>
                <p style={{ color: 'var(--muted-plum)', fontSize: '0.88rem', lineHeight: 1.75, maxWidth: 500, margin: '0 auto', }}>
                  Tap a chapter above to begin. Each one takes just a few minutes and unlocks the next.
                </p>
              </>
            )}
          </motion.div>
        </>
      )}
    </div>
  )
}
