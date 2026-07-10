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
import { FIRST_KATAKANA, KATAKANA_MATCH_PAIRS, LOANWORDS, KATAKANA_QUIZ } from './content/katakana'

const STAGES = ['learn', 'loanwords', 'match', 'quiz', 'done']

export default function KatakanaChapter() {
  const [stage, setStage] = useState('learn')
  const { finish, unlockedBadge, closeBadgeModal, showXpToast } = useChapterCompletion('first-katakana', '/journey/first-kanji')

  return (
    <div className="journey-content-wrap">
      <ChapterHeader chapter={CHAPTERS['first-katakana']} />

      <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
        {['Learn', 'Loanwords', 'Match', 'Quiz', 'Done'].map((label, i) => (
          <span key={label} className="badge" style={{
            background: STAGES.indexOf(stage) >= i ? 'rgba(124,58,237,0.14)' : 'rgba(0,0,0,0.05)',
            color: STAGES.indexOf(stage) >= i ? '#7c3aed' : 'var(--muted-plum)',
          }}>{label}</span>
        ))}
      </div>

      {stage === 'learn' && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <p style={{ textAlign: 'center', color: 'var(--muted-plum)', fontSize: '0.88rem', marginBottom: 16 }}>
            Same sounds as hiragana, sharper shapes. These 10 katakana spell out foreign words all over Japan.
          </p>
          <div className="kanji-grid">
            {FIRST_KATAKANA.map((k, i) => (
              <CharacterDrillCard key={k.char} character={k.char} romaji={k.romaji} delay={i * 0.04} />
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: 20 }}>
            <button type="button" className="primary-btn" onClick={() => setStage('loanwords')}>See Loanwords in Action →</button>
          </div>
        </motion.div>
      )}

      {stage === 'loanwords' && (
        <motion.div className="clay-card" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <h2 style={{ fontSize: '1.05rem', fontWeight: 900, color: 'var(--dark-ink)', marginBottom: 4, textAlign: 'center' }}>Words you already know</h2>
          <p style={{ textAlign: 'center', color: 'var(--muted-plum)', fontSize: '0.85rem', marginBottom: 16 }}>
            Katakana often spells out English words with a Japanese accent.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {LOANWORDS.map((w, i) => (
              <motion.div key={w.word} className="plan-item" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}>
                <span style={{ fontSize: '1.4rem', fontWeight: 800, color: '#7c3aed', minWidth: 100 }}>{w.word}</span>
                <div className="plan-item-text">
                  <div className="plan-item-name">{w.meaning}</div>
                  <div className="plan-item-count">{w.romaji}</div>
                </div>
              </motion.div>
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: 20 }}>
            <button type="button" className="primary-btn" onClick={() => setStage('match')}>Match Them →</button>
          </div>
        </motion.div>
      )}

      {stage === 'match' && (
        <motion.div className="clay-card" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <h2 style={{ fontSize: '1.05rem', fontWeight: 900, color: 'var(--dark-ink)', marginBottom: 14, textAlign: 'center' }}>Match each character to its sound</h2>
          <MatchingQuiz pairs={KATAKANA_MATCH_PAIRS} onComplete={() => setStage('quiz')} />
        </motion.div>
      )}

      {stage === 'quiz' && (
        <motion.div className="clay-card" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <MultipleChoiceQuiz questions={KATAKANA_QUIZ} onComplete={() => setStage('done')} />
        </motion.div>
      )}

      {stage === 'done' && (
        <motion.div className="clay-card" style={{ textAlign: 'center' }} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <div style={{ fontSize: '2.4rem', marginBottom: 8 }}>🗾</div>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 900, color: 'var(--dark-ink)', marginBottom: 8 }}>You're now a Katakana Explorer!</h2>
          <p style={{ color: 'var(--muted-plum)', fontSize: '0.88rem', marginBottom: 18 }}>Next time you see a menu in Japan, you'll recognize more than you think.</p>
          <button type="button" className="primary-btn" onClick={finish}>Continue →</button>
        </motion.div>
      )}

      <XPToast xp={CHAPTERS['first-katakana'].xp} visible={showXpToast} />
      <AchievementUnlockModal open={!!unlockedBadge} badge={unlockedBadge} onClose={closeBadgeModal} />
    </div>
  )
}
