import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import ChapterHeader from '../../components/journey/ChapterHeader'
import DialogueScene from '../../components/journey/DialogueScene'
import AchievementUnlockModal from '../../components/journey/AchievementUnlockModal'
import XPToast from '../../components/journey/XPToast'
import { useChapterCompletion } from '../../components/journey/useChapterCompletion'
import { CHAPTERS } from './content/chapters'
import { DIALOGUE_SCRIPTS, SCENARIO_ORDER } from './content/dialogues'

const STORAGE_KEY = 'jlpt-journey-scenarios'

function readCompletedScenarios() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    return raw ? new Set(JSON.parse(raw)) : new Set()
  } catch {
    return new Set()
  }
}

export default function ConversationChapter() {
  const { scenarioId } = useParams()
  const navigate = useNavigate()
  const [activeScenario, setActiveScenario] = useState(scenarioId ?? null)
  const [completedScenarios, setCompletedScenarios] = useState(readCompletedScenarios)
  const { finish, unlockedBadge, closeBadgeModal, showXpToast } = useChapterCompletion('daily-conversation', '/journey/japanese-culture')

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify([...completedScenarios]))
  }, [completedScenarios])

  const allDone = SCENARIO_ORDER.every((id) => completedScenarios.has(id))

  function onScenarioComplete(id) {
    setCompletedScenarios((prev) => new Set(prev).add(id))
    setActiveScenario(null)
    navigate('/journey/daily-conversation')
  }

  return (
    <div className="journey-content-wrap">
      <ChapterHeader chapter={CHAPTERS['daily-conversation']} />

      <AnimatePresence mode="wait">
        {activeScenario ? (
          <motion.div key="scene" className="clay-card clay-card--lg" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}>
            <button type="button" className="ghost-btn btn-sm" style={{ marginBottom: 16 }} onClick={() => { setActiveScenario(null); navigate('/journey/daily-conversation') }}>
              ← Back to scenarios
            </button>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 900, color: 'var(--dark-ink)', marginBottom: 20 }}>
              {DIALOGUE_SCRIPTS[activeScenario].icon} {DIALOGUE_SCRIPTS[activeScenario].title}
            </h2>
            <DialogueScene
              script={DIALOGUE_SCRIPTS[activeScenario]}
              onComplete={() => onScenarioComplete(activeScenario)}
            />
          </motion.div>
        ) : (
          <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <p style={{ textAlign: 'center', color: 'var(--muted-plum)', fontSize: '0.88rem', marginBottom: 18 }}>
              Seven real situations you'll actually run into in Japan. Play through each one — choose your response and see how it lands.
            </p>
            <div className="grid-3">
              {SCENARIO_ORDER.map((id, i) => {
                const script = DIALOGUE_SCRIPTS[id]
                const done = completedScenarios.has(id)
                return (
                  <motion.button
                    key={id} type="button"
                    className="content-card"
                    style={{ textAlign: 'left', cursor: 'pointer', border: done ? '1.5px solid rgba(52,211,153,0.4)' : undefined }}
                    initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                    onClick={() => { setActiveScenario(id); navigate(`/journey/daily-conversation/${id}`) }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ fontSize: '1.8rem', marginBottom: 8 }}>{script.icon}</div>
                      {done && <span className="badge" style={{ background: 'rgba(52,211,153,0.15)', color: '#059669' }}>✓ Done</span>}
                    </div>
                    <h3>{script.title}</h3>
                    <p>with {script.characters.npc.name}</p>
                  </motion.button>
                )
              })}
            </div>

            <motion.div className="clay-card" style={{ textAlign: 'center', marginTop: 24 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <p style={{ color: 'var(--muted-plum)', fontSize: '0.85rem', marginBottom: 16 }}>
                {allDone ? 'All seven scenarios complete!' : `${completedScenarios.size} / ${SCENARIO_ORDER.length} scenarios complete`}
              </p>
              <button type="button" className="primary-btn" disabled={!allDone} onClick={finish}>
                {allDone ? 'Continue →' : `Complete all ${SCENARIO_ORDER.length} scenarios to continue`}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <XPToast xp={CHAPTERS['daily-conversation'].xp} visible={showXpToast} />
      <AchievementUnlockModal open={!!unlockedBadge} badge={unlockedBadge} onClose={closeBadgeModal} />
    </div>
  )
}
