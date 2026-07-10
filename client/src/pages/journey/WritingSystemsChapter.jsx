import { useState } from 'react'
import { motion } from 'framer-motion'
import ChapterHeader from '../../components/journey/ChapterHeader'
import FlipCard from '../../components/journey/FlipCard'
import MultipleChoiceQuiz from '../../components/journey/MultipleChoiceQuiz'
import AchievementUnlockModal from '../../components/journey/AchievementUnlockModal'
import XPToast from '../../components/journey/XPToast'
import { useChapterCompletion } from '../../components/journey/useChapterCompletion'
import { CHAPTERS } from './content/chapters'
import { WRITING_SYSTEMS, WRITING_SYSTEMS_QUIZ } from './content/writingSystemsQuiz'

export default function WritingSystemsChapter() {
  const [flipped, setFlipped] = useState({})
  const [showQuiz, setShowQuiz] = useState(false)
  const [quizDone, setQuizDone] = useState(false)
  const { finish, unlockedBadge, closeBadgeModal, showXpToast } = useChapterCompletion('writing-systems', '/journey/first-hiragana')

  const allFlipped = WRITING_SYSTEMS.every((s) => flipped[s.id])

  return (
    <div className="journey-content-wrap">
      <ChapterHeader chapter={CHAPTERS['writing-systems']} />

      <motion.div className="notice notice-gold" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <strong>Tap each card</strong> to reveal what it is — then read the example word underneath.
      </motion.div>

      <div className="grid-3">
        {WRITING_SYSTEMS.map((system, i) => (
          <motion.div key={system.id} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <FlipCard
              flipped={!!flipped[system.id]}
              onFlip={() => setFlipped((f) => ({ ...f, [system.id]: !f[system.id] }))}
              front={
                <div>
                  <div style={{ fontSize: '2rem', fontWeight: 900, color: system.color }}>{system.front}</div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--muted-plum)', marginTop: 10 }}>Tap to discover</p>
                </div>
              }
              back={<p style={{ fontSize: '0.82rem', color: 'var(--dark-ink)', lineHeight: 1.6 }}>{system.back}</p>}
            />
            <div style={{ textAlign: 'center', marginTop: 10 }}>
              <span style={{ fontSize: '1.3rem', fontWeight: 800, color: system.color }}>{system.example}</span>
              <span style={{ fontSize: '0.78rem', color: 'var(--muted-plum)', marginLeft: 8 }}>“{system.label}”</span>
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div className="clay-card" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
        <h2 style={{ fontSize: '1.05rem', fontWeight: 900, color: 'var(--dark-ink)', marginBottom: 10 }}>Why three scripts?</h2>
        <p style={{ color: 'var(--muted-plum)', fontSize: '0.88rem', lineHeight: 1.8 }}>
          Japanese didn't have a writing system of its own, so it borrowed kanji from China over a thousand years ago.
          Hiragana and katakana were later developed <em>from</em> kanji to represent Japanese sounds — hiragana for
          native grammar, katakana for foreign words. Today all three work together in nearly every sentence, like
          gears in the same machine.
        </p>
      </motion.div>

      {!showQuiz ? (
        <motion.div className="clay-card" style={{ textAlign: 'center' }} initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
          <h2 style={{ fontSize: '1.05rem', fontWeight: 900, color: 'var(--dark-ink)', marginBottom: 8 }}>Quick check</h2>
          <p style={{ color: 'var(--muted-plum)', fontSize: '0.85rem', marginBottom: 16 }}>
            {allFlipped ? 'A 5-question mini quiz to lock it in.' : 'Flip all three cards above first, then take a quick 5-question quiz.'}
          </p>
          <button type="button" className="primary-btn" disabled={!allFlipped} onClick={() => setShowQuiz(true)}>
            Start Mini Quiz →
          </button>
        </motion.div>
      ) : (
        <motion.div className="clay-card" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          {!quizDone ? (
            <MultipleChoiceQuiz questions={WRITING_SYSTEMS_QUIZ} onComplete={() => setQuizDone(true)} />
          ) : (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2.2rem', marginBottom: 8 }}>✅</div>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 900, color: 'var(--dark-ink)', marginBottom: 12 }}>Nice work!</h2>
              <button type="button" className="primary-btn" onClick={finish}>Continue →</button>
            </div>
          )}
        </motion.div>
      )}

      <XPToast xp={CHAPTERS['writing-systems'].xp} visible={showXpToast} />
      <AchievementUnlockModal open={!!unlockedBadge} badge={unlockedBadge} onClose={closeBadgeModal} />
    </div>
  )
}
