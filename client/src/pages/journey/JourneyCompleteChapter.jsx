import { motion } from 'framer-motion'
import { useAuth } from '../../contexts/AuthContext'
import { useJourney } from '../../contexts/JourneyContext'
import ChapterHeader from '../../components/journey/ChapterHeader'
import { useChapterCompletion } from '../../components/journey/useChapterCompletion'
import { CHAPTERS, TOTAL_JOURNEY_XP } from './content/chapters'

const CONFETTI = ['🌸', '✨', '🎉', '⭐', '🎊']

export default function JourneyCompleteChapter() {
  const { user } = useAuth()
  const { state } = useJourney()
  const { finish } = useChapterCompletion('complete', '/levels/N5')

  return (
    <div className="journey-content-wrap">
      <ChapterHeader chapter={CHAPTERS.complete} />

      <motion.div className="clay-card clay-card--lg" style={{ textAlign: 'center', position: 'relative', overflow: 'hidden' }}
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>

        {CONFETTI.map((c, i) => (
          <motion.span key={i} aria-hidden="true"
            style={{ position: 'absolute', fontSize: '1.6rem', left: `${10 + i * 18}%`, top: -20 }}
            animate={{ y: [0, 340], rotate: [0, 180], opacity: [1, 1, 0] }}
            transition={{ duration: 3 + i * 0.4, repeat: Infinity, delay: i * 0.5, ease: 'easeIn' }}
          >
            {c}
          </motion.span>
        ))}

        <motion.div style={{ fontSize: '3.5rem', marginBottom: 8 }}
          initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}>
          🎓
        </motion.div>
        <p className="eyebrow">Certificate of Completion</p>
        <h1 style={{ fontSize: 'clamp(1.4rem, 3vw, 2rem)', fontWeight: 900, color: 'var(--dark-ink)', margin: '10px 0 4px' }}>
          {user?.username ?? 'Traveler'}
        </h1>
        <p style={{ color: 'var(--muted-plum)', fontSize: '0.9rem', maxWidth: 480, margin: '0 auto' }}>
          has completed the Beginner Journey — landing in Japan, discovering hiragana, katakana, and kanji,
          holding real conversations, and exploring Japanese culture.
        </p>

        <div style={{ display: 'flex', gap: 28, justifyContent: 'center', marginTop: 26, flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#b45309' }}>{state.xp.toLocaleString()}</div>
            <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--muted-plum)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>XP Earned</div>
          </div>
          <div>
            <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#7c3aed' }}>{state.badges.length}</div>
            <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--muted-plum)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Badges Unlocked</div>
          </div>
          <div>
            <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#059669' }}>{state.completedChapters.length}</div>
            <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--muted-plum)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Chapters Complete</div>
          </div>
        </div>
      </motion.div>

      <motion.div className="clay-card" style={{ textAlign: 'center' }} initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
        <h2 style={{ fontSize: '1.15rem', fontWeight: 900, color: 'var(--dark-ink)', marginBottom: 8 }}>
          Base camp complete. The real climb begins.
        </h2>
        <p style={{ color: 'var(--muted-plum)', fontSize: '0.88rem', lineHeight: 1.75, maxWidth: 480, margin: '0 auto 20px' }}>
          You now know your first characters, your first kanji, and how to hold a real conversation.
          N5 will build on all of it — 46 more hiragana, 46 more katakana, and a real path toward fluency.
        </p>
        <button type="button" className="primary-btn" onClick={finish}>
          Begin N5 {CHAPTERS.complete.xp > 0 ? `(+${CHAPTERS.complete.xp} XP)` : ''} 🎓
        </button>
        <p style={{ fontSize: '0.72rem', color: 'var(--muted-plum)', marginTop: 12 }}>
          Total available: {TOTAL_JOURNEY_XP.toLocaleString()} XP across the whole Beginner Journey
        </p>
      </motion.div>
    </div>
  )
}
