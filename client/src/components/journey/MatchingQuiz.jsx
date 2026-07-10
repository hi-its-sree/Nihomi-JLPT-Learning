import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'

function shuffled(arr) {
  const copy = [...arr]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

// pairs: [{ id, left, right }]. onComplete(score 0-100) fires once all pairs are matched.
export default function MatchingQuiz({ pairs, onComplete }) {
  const leftItems = useMemo(() => shuffled(pairs.map((p) => ({ id: p.id, label: p.left }))), [pairs])
  const rightItems = useMemo(() => shuffled(pairs.map((p) => ({ id: p.id, label: p.right }))), [pairs])

  const [selectedLeft, setSelectedLeft] = useState(null)
  const [selectedRight, setSelectedRight] = useState(null)
  const [matched, setMatched] = useState(new Set())
  const [wrongFlash, setWrongFlash] = useState(null)
  const [wrongCount, setWrongCount] = useState(0)
  const [done, setDone] = useState(false)

  useEffect(() => {
    if (selectedLeft === null || selectedRight === null) return
    if (selectedLeft === selectedRight) {
      setMatched((prev) => new Set(prev).add(selectedLeft))
      setSelectedLeft(null)
      setSelectedRight(null)
    } else {
      setWrongCount((c) => c + 1)
      setWrongFlash({ left: selectedLeft, right: selectedRight })
      const t = setTimeout(() => {
        setWrongFlash(null)
        setSelectedLeft(null)
        setSelectedRight(null)
      }, 500)
      return () => clearTimeout(t)
    }
  }, [selectedLeft, selectedRight])

  useEffect(() => {
    if (matched.size === pairs.length && !done) {
      setDone(true)
      const score = Math.round((pairs.length / (pairs.length + wrongCount)) * 100)
      onComplete?.(score)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [matched])

  function tileClass(id, side) {
    if (matched.has(id)) return 'matched'
    if (wrongFlash && wrongFlash[side] === id) return 'wrong'
    if (side === 'left' && selectedLeft === id) return 'selected'
    if (side === 'right' && selectedRight === id) return 'selected'
    return ''
  }

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {leftItems.map((item, i) => (
            <motion.button key={item.id} type="button"
              className={`match-tile ${tileClass(item.id, 'left')}`}
              disabled={matched.has(item.id)}
              onClick={() => setSelectedLeft(item.id)}
              initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
            >
              {item.label}
            </motion.button>
          ))}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {rightItems.map((item, i) => (
            <motion.button key={item.id} type="button"
              className={`match-tile ${tileClass(item.id, 'right')}`}
              disabled={matched.has(item.id)}
              onClick={() => setSelectedRight(item.id)}
              initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
            >
              {item.label}
            </motion.button>
          ))}
        </div>
      </div>
      <p style={{ marginTop: 16, fontSize: '0.8rem', color: 'var(--muted-plum)', textAlign: 'center' }}>
        {matched.size} / {pairs.length} matched
      </p>
    </div>
  )
}
