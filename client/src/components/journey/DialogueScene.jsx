import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

// Generic data-driven branching dialogue engine — every conversation scenario
// (all 7 of them) is this same component fed a different `script`.
//
// script shape:
// {
//   id, title, characters: { player: {name,avatar}, npc: {name,avatar} },
//   startNode, xpReward,
//   nodes: {
//     [nodeId]: {
//       speaker: 'npc' | 'player', text, translation,
//       choices?: [{ text, correct, next, feedback }],
//       end?: true,
//     }
//   }
// }
export default function DialogueScene({ script, onComplete }) {
  const [nodeId, setNodeId] = useState(script.startNode)
  const [choiceIndex, setChoiceIndex] = useState(null)
  const [stats, setStats] = useState({ correct: 0, total: 0 })

  const node = script.nodes[nodeId]
  const speakerInfo = node.speaker === 'player' ? script.characters.player : script.characters.npc

  function choose(i) {
    if (choiceIndex !== null) return
    setChoiceIndex(i)
    setStats((s) => ({ correct: s.correct + (node.choices[i].correct ? 1 : 0), total: s.total + 1 }))
  }

  function advance() {
    if (node.end) {
      const score = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 100
      onComplete?.(script.xpReward, score)
      return
    }
    const chosen = node.choices?.[choiceIndex]
    setNodeId(chosen ? chosen.next : node.next)
    setChoiceIndex(null)
  }

  return (
    <div>
      <AnimatePresence mode="wait">
        <motion.div key={nodeId} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.25 }}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
            <span style={{ fontSize: '2rem', flexShrink: 0 }}>{speakerInfo.avatar}</span>
            <div>
              <p style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--muted-plum)', marginBottom: 4 }}>{speakerInfo.name}</p>
              <div className="dialogue-bubble">
                <p className="dialogue-jp">{node.text}</p>
                {node.translation && <p className="dialogue-translation">{node.translation}</p>}
              </div>
            </div>
          </div>

          {node.choices && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 18, marginLeft: 48 }}>
              {node.choices.map((choice, i) => {
                let cls = ''
                if (choiceIndex !== null) {
                  cls = i === choiceIndex ? (choice.correct ? 'correct' : 'incorrect') : ''
                }
                return (
                  <button key={i} type="button" className={`dialogue-choice ${cls}`} onClick={() => choose(i)} disabled={choiceIndex !== null}>
                    {choice.text}
                  </button>
                )
              })}
            </div>
          )}

          {choiceIndex !== null && node.choices?.[choiceIndex]?.feedback && (
            <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
              className={`dialogue-feedback ${node.choices[choiceIndex].correct ? 'correct' : 'incorrect'}`}
              style={{ marginTop: 12, marginLeft: 48 }}>
              {node.choices[choiceIndex].feedback}
            </motion.div>
          )}

          {(node.end || !node.choices || choiceIndex !== null) && (
            <div style={{ marginLeft: 48, marginTop: 16 }}>
              <button type="button" className="primary-btn" onClick={advance}>
                {node.end ? `Finish scenario →` : 'Continue →'}
              </button>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
