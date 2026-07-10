import { useState } from 'react'
import { motion } from 'framer-motion'
import ChapterHeader from '../../components/journey/ChapterHeader'
import CharacterDrillCard from '../../components/journey/CharacterDrillCard'
import MatchingQuiz from '../../components/journey/MatchingQuiz'
import MultipleChoiceQuiz from '../../components/journey/MultipleChoiceQuiz'
import AchievementUnlockModal from '../../components/journey/AchievementUnlockModal'
import XPToast from '../../components/journey/XPToast'
import { useChapterCompletion } from '../../components/journey/useChapterCompletion'
import { CHAPTERS } from './content/chapters'
import { FIRST_HIRAGANA, HIRAGANA_MATCH_PAIRS, HIRAGANA_QUIZ } from './content/hiragana'

const STAGES = ['learn', 'match', 'quiz', 'done']

export default function HiraganaChapter() {
  const [stage, setStage] = useState('learn')
  const { finish, unlockedBadge, closeBadgeModal, showXpToast } = useChapterCompletion('first-hiragana', '/journey/first-katakana')

  return (
    <div className="journey-content-wrap">
      <ChapterHeader chapter={CHAPTERS['first-hiragana']} />

      <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
        {['Learn', 'Match', 'Quiz', 'Done'].map((label, i) => (
          <span key={label} className="badge" style={{
            background: STAGES.indexOf(stage) >= i ? 'rgba(219,39,119,0.14)' : 'rgba(0,0,0,0.05)',
            color: STAGES.indexOf(stage) >= i ? '#db2777' : 'var(--muted-plum)',
          }}>{label}</span>
        ))}
      </div>

      {stage === 'learn' && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <p style={{ textAlign: 'center', color: 'var(--muted-plum)', fontSize: '0.88rem', marginBottom: 16 }}>
            These 10 hiragana are the "a-i-u-e-o" and "ka-ki-ku-ke-ko" rows — the very first sounds every Japanese learner memorizes.
          </p>
          <div className="kanji-grid">
            {FIRST_HIRAGANA.map((h, i) => (
              <CharacterDrillCard key={h.char} character={h.char} romaji={h.romaji} delay={i * 0.04} />
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: 20 }}>
            <button type="button" className="primary-btn" onClick={() => setStage('match')}>I've got it — Match Them →</button>
          </div>
        </motion.div>
      )}

      {stage === 'match' && (
        <motion.div className="clay-card" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <h2 style={{ fontSize: '1.05rem', fontWeight: 900, color: 'var(--dark-ink)', marginBottom: 14, textAlign: 'center' }}>Match each character to its sound</h2>
          <MatchingQuiz pairs={HIRAGANA_MATCH_PAIRS} onComplete={() => setStage('quiz')} />
        </motion.div>
      )}

      {stage === 'quiz' && (
        <motion.div className="clay-card" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <MultipleChoiceQuiz questions={HIRAGANA_QUIZ} onComplete={() => setStage('done')} />
        </motion.div>
      )}

      {stage === 'done' && (
        <motion.div className="clay-card" style={{ textAlign: 'center' }} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <div style={{ fontSize: '2.4rem', marginBottom: 8 }}>🌸</div>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 900, color: 'var(--dark-ink)', marginBottom: 8 }}>You just read your first Japanese characters!</h2>
          <p style={{ color: 'var(--muted-plum)', fontSize: '0.88rem', marginBottom: 18 }}>あ・い・う・え・お・か・き・く・け・こ are yours now. 40 more hiragana await in N5.</p>
          <button type="button" className="primary-btn" onClick={finish}>Continue →</button>
        </motion.div>
      )}

      <XPToast xp={CHAPTERS['first-hiragana'].xp} visible={showXpToast} />
      <AchievementUnlockModal open={!!unlockedBadge} badge={unlockedBadge} onClose={closeBadgeModal} />
    </div>
  )
}
