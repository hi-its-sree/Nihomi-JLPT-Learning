import { useState } from 'react'
import { motion } from 'framer-motion'
import ChapterHeader from '../../components/journey/ChapterHeader'
import FlipCard from '../../components/journey/FlipCard'
import MultipleChoiceQuiz from '../../components/journey/MultipleChoiceQuiz'
import AchievementUnlockModal from '../../components/journey/AchievementUnlockModal'
import XPToast from '../../components/journey/XPToast'
import { useChapterCompletion } from '../../components/journey/useChapterCompletion'
import { CHAPTERS } from './content/chapters'
import { FIRST_KANJI, KANJI_QUIZ } from './content/kanji'

export default function KanjiChapter() {
  const [flipped, setFlipped] = useState({})
  const [showQuiz, setShowQuiz] = useState(false)
  const [quizDone, setQuizDone] = useState(false)
  const { finish, unlockedBadge, closeBadgeModal, showXpToast } = useChapterCompletion('first-kanji', '/journey/study-effectively')

  const allFlipped = FIRST_KANJI.every((k) => flipped[k.char])

  return (
    <div className="journey-content-wrap">
      <ChapterHeader chapter={CHAPTERS['first-kanji']} />

      <motion.div className="notice notice-gold" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <strong>Tap each kanji</strong> to reveal its reading, stroke count, and a memory trick for remembering it.
      </motion.div>

      <div className="grid-3">
        {FIRST_KANJI.map((k, i) => (
          <motion.div key={k.char} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
            <FlipCard
              height={240}
              flipped={!!flipped[k.char]}
              onFlip={() => setFlipped((f) => ({ ...f, [k.char]: !f[k.char] }))}
              front={
                <div>
                  <div className="kanji-char" style={{ fontSize: '3.2rem' }}>{k.char}</div>
                  <p style={{ fontSize: '0.82rem', color: 'var(--muted-plum)', marginTop: 8, fontWeight: 700 }}>{k.meaning}</p>
                  <p style={{ fontSize: '0.72rem', color: 'var(--muted-plum)', marginTop: 10 }}>Tap to discover</p>
                </div>
              }
              back={
                <div style={{ textAlign: 'left' }}>
                  <p style={{ fontSize: '0.78rem', color: 'var(--terracotta)', fontWeight: 800 }}>音readings: {k.onyomi}</p>
                  <p style={{ fontSize: '0.78rem', color: 'var(--terracotta)', fontWeight: 800, marginTop: 2 }}>訓readings: {k.kunyomi}</p>
                  <p style={{ fontSize: '0.78rem', color: 'var(--dark-ink)', fontWeight: 700, marginTop: 6 }}>{k.strokeCount} strokes</p>
                  <p style={{ fontSize: '0.78rem', color: 'var(--muted-plum)', marginTop: 8, lineHeight: 1.6 }}>{k.mnemonic}</p>
                </div>
              }
            />
          </motion.div>
        ))}
      </div>

      {!showQuiz ? (
        <motion.div className="clay-card" style={{ textAlign: 'center' }} initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
          <h2 style={{ fontSize: '1.05rem', fontWeight: 900, color: 'var(--dark-ink)', marginBottom: 8 }}>Ready to test yourself?</h2>
          <p style={{ color: 'var(--muted-plum)', fontSize: '0.85rem', marginBottom: 16 }}>
            {allFlipped ? 'Five quick questions on 日人山水学.' : 'Flip all five kanji cards above first.'}
          </p>
          <button type="button" className="primary-btn" disabled={!allFlipped} onClick={() => setShowQuiz(true)}>
            Start Quiz →
          </button>
        </motion.div>
      ) : (
        <motion.div className="clay-card" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          {!quizDone ? (
            <MultipleChoiceQuiz questions={KANJI_QUIZ} onComplete={() => setQuizDone(true)} />
          ) : (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2.4rem', marginBottom: 8 }}>🖌</div>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 900, color: 'var(--dark-ink)', marginBottom: 8 }}>First Kanji Master!</h2>
              <p style={{ color: 'var(--muted-plum)', fontSize: '0.88rem', marginBottom: 18 }}>日人山水学 are yours. N5 introduces 103 kanji — you've already met five.</p>
              <button type="button" className="primary-btn" onClick={finish}>Continue →</button>
            </div>
          )}
        </motion.div>
      )}

      <XPToast xp={CHAPTERS['first-kanji'].xp} visible={showXpToast} />
      <AchievementUnlockModal open={!!unlockedBadge} badge={unlockedBadge} onClose={closeBadgeModal} />
    </div>
  )
}
