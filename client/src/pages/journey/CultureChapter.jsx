import { useState } from 'react'
import { motion } from 'framer-motion'
import ChapterHeader from '../../components/journey/ChapterHeader'
import FlipCard from '../../components/journey/FlipCard'
import MultipleChoiceQuiz from '../../components/journey/MultipleChoiceQuiz'
import AchievementUnlockModal from '../../components/journey/AchievementUnlockModal'
import XPToast from '../../components/journey/XPToast'
import { useChapterCompletion } from '../../components/journey/useChapterCompletion'
import { CHAPTERS } from './content/chapters'
import { CULTURE_TOPICS, CULTURE_QUIZ } from './content/culture'

export default function CultureChapter() {
  const [flipped, setFlipped] = useState({})
  const [showQuiz, setShowQuiz] = useState(false)
  const [quizDone, setQuizDone] = useState(false)
  const { finish, unlockedBadge, closeBadgeModal, showXpToast } = useChapterCompletion('japanese-culture', '/journey/complete')

  const flippedCount = Object.values(flipped).filter(Boolean).length
  const readyForQuiz = flippedCount >= CULTURE_TOPICS.length

  return (
    <div className="journey-content-wrap">
      <ChapterHeader chapter={CHAPTERS['japanese-culture']} />

      <motion.div className="notice notice-gold" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <strong>Tap each card</strong> to reveal a fun fact — flip all {CULTURE_TOPICS.length} before the quiz unlocks. ({flippedCount}/{CULTURE_TOPICS.length})
      </motion.div>

      <div className="grid-3">
        {CULTURE_TOPICS.map((topic, i) => (
          <motion.div key={topic.id} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <FlipCard
              height={200}
              flipped={!!flipped[topic.id]}
              onFlip={() => setFlipped((f) => ({ ...f, [topic.id]: true }))}
              front={
                <div>
                  <div style={{ fontSize: '2.4rem' }}>{topic.icon}</div>
                  <p style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--dark-ink)', marginTop: 8 }}>{topic.title}</p>
                  <p style={{ fontSize: '0.72rem', color: 'var(--muted-plum)', marginTop: 8 }}>Tap for a fun fact</p>
                </div>
              }
              back={
                <div>
                  <p style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--terracotta)', marginBottom: 8 }}>{topic.fact}</p>
                  <p style={{ fontSize: '0.78rem', color: 'var(--dark-ink)', lineHeight: 1.6 }}>{topic.detail}</p>
                </div>
              }
            />
          </motion.div>
        ))}
      </div>

      {!showQuiz ? (
        <motion.div className="clay-card" style={{ textAlign: 'center' }} initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
          <h2 style={{ fontSize: '1.05rem', fontWeight: 900, color: 'var(--dark-ink)', marginBottom: 8 }}>Culture quiz</h2>
          <p style={{ color: 'var(--muted-plum)', fontSize: '0.85rem', marginBottom: 16 }}>
            {readyForQuiz ? 'A short quiz on what you just discovered.' : `Flip all ${CULTURE_TOPICS.length} cards to unlock the quiz.`}
          </p>
          <button type="button" className="primary-btn" disabled={!readyForQuiz} onClick={() => setShowQuiz(true)}>Start Quiz →</button>
        </motion.div>
      ) : (
        <motion.div className="clay-card" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          {!quizDone ? (
            <MultipleChoiceQuiz questions={CULTURE_QUIZ} onComplete={() => setQuizDone(true)} />
          ) : (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2.4rem', marginBottom: 8 }}>🎌</div>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 900, color: 'var(--dark-ink)', marginBottom: 8 }}>Culture Explorer!</h2>
              <p style={{ color: 'var(--muted-plum)', fontSize: '0.88rem', marginBottom: 18 }}>You now know more everyday Japanese etiquette than most first-time visitors.</p>
              <button type="button" className="primary-btn" onClick={finish}>Continue →</button>
            </div>
          )}
        </motion.div>
      )}

      <XPToast xp={CHAPTERS['japanese-culture'].xp} visible={showXpToast} />
      <AchievementUnlockModal open={!!unlockedBadge} badge={unlockedBadge} onClose={closeBadgeModal} />
    </div>
  )
}
