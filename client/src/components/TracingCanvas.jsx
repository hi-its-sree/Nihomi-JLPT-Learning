import { useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { samplePath, gradeStroke } from '../lib/strokeMatch.mjs'

// Draw-it-yourself counterpart to StrokeOrderPlayer: the learner traces one
// stroke at a time and each attempt is graded against the KanjiVG reference.
//
// Strokes already accepted stay inked on the canvas; the stroke being asked for
// can be shown as a faint ghost via "Show me".
export default function TracingCanvas({ strokes = [], character = '', onComplete }) {
  const surfaceRef = useRef(null)
  // Points live in a ref as well as state: state drives the live ink, but the
  // ref is what gets graded, so a pointermove that hasn't re-rendered yet can't
  // silently drop the tail of the stroke.
  const pointsRef = useRef([])
  const [strokeIndex, setStrokeIndex] = useState(0)
  const [drawing, setDrawing] = useState(false)
  const [points, setPoints] = useState([])
  const [accepted, setAccepted] = useState([])   // indices drawn correctly, in order
  const [feedback, setFeedback] = useState(null) // { ok, message } | null
  const [hintFor, setHintFor] = useState(null)   // stroke index being revealed
  const [attempts, setAttempts] = useState(0)
  const [misses, setMisses] = useState(0)

  // Reference paths sampled once per character — this touches the DOM, so it
  // must not run on every pointer move.
  const targets = useMemo(() => strokes.map((d) => samplePath(d)), [strokes])

  useEffect(() => {
    setStrokeIndex(0)
    pointsRef.current = []
    setPoints([])
    setAccepted([])
    setFeedback(null)
    setHintFor(null)
    setAttempts(0)
    setMisses(0)
  }, [strokes])

  const finished = strokes.length > 0 && strokeIndex >= strokes.length

  function toViewBox(event) {
    const rect = surfaceRef.current.getBoundingClientRect()
    return {
      x: ((event.clientX - rect.left) / rect.width) * 200,
      y: ((event.clientY - rect.top) / rect.height) * 200,
    }
  }

  function handlePointerDown(event) {
    if (finished) return
    event.currentTarget.setPointerCapture?.(event.pointerId)
    setDrawing(true)
    setFeedback(null)
    const start = toViewBox(event)
    pointsRef.current = [start]
    setPoints([start])
  }

  function handlePointerMove(event) {
    if (!drawing) return
    const next = toViewBox(event)
    pointsRef.current = [...pointsRef.current, next]
    setPoints(pointsRef.current)
  }

  function handlePointerUp(event) {
    if (!drawing) return
    event.currentTarget.releasePointerCapture?.(event.pointerId)
    setDrawing(false)

    const drawn = pointsRef.current
    pointsRef.current = []
    setPoints([])
    if (drawn.length === 0) return

    const result = gradeStroke(drawn, targets, strokeIndex)
    setAttempts((n) => n + 1)
    setFeedback(result)

    if (!result.ok) {
      setMisses((n) => n + 1)
      return
    }

    setHintFor(null)
    const nextAccepted = [...accepted, strokeIndex]
    setAccepted(nextAccepted)
    const nextIndex = strokeIndex + 1
    setStrokeIndex(nextIndex)

    if (nextIndex >= strokes.length) {
      onComplete?.({ attempts: attempts + 1, misses, strokes: strokes.length })
    }
  }

  function undo() {
    if (accepted.length === 0) return
    setAccepted(accepted.slice(0, -1))
    setStrokeIndex(Math.max(0, strokeIndex - 1))
    setFeedback(null)
  }

  function clearAll() {
    setAccepted([])
    setStrokeIndex(0)
    pointsRef.current = []
    setPoints([])
    setFeedback(null)
    setHintFor(null)
  }

  const drawnPath = points.length > 1
    ? `M ${points.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' L ')}`
    : null

  return (
    <div className="stroke-player">
      <p style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--muted-plum)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
        {finished ? 'Complete ✓' : `Trace stroke ${strokeIndex + 1} of ${strokes.length}`}
      </p>

      <div
        ref={surfaceRef}
        className="stroke-canvas trace-canvas"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        style={{ touchAction: 'none', cursor: finished ? 'default' : 'crosshair' }}
      >
        {/* Guide grid + the character itself as a very faint backdrop */}
        <svg viewBox="0 0 200 200" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
          <line x1="100" y1="0" x2="100" y2="200" stroke="rgba(201,122,74,0.10)" strokeWidth="1" strokeDasharray="4,4"/>
          <line x1="0" y1="100" x2="200" y2="100" stroke="rgba(201,122,74,0.10)" strokeWidth="1" strokeDasharray="4,4"/>
          <text
            x="100" y="100" textAnchor="middle" dominantBaseline="central"
            fontSize="150" fill="rgba(47,42,36,0.05)" style={{ userSelect: 'none' }}
          >
            {character}
          </text>
        </svg>

        <svg viewBox="0 0 200 200" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
          {/* Strokes already accepted */}
          {accepted.map((index) => (
            <path
              key={`done-${index}`}
              d={strokes[index]}
              stroke="#2f2a24" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" fill="none"
            />
          ))}

          {/* "Show me" ghost of the stroke currently being asked for */}
          {hintFor === strokeIndex && strokes[strokeIndex] && (
            <motion.path
              d={strokes[strokeIndex]}
              stroke="rgba(201,122,74,0.55)" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" fill="none"
              strokeDasharray="4,6"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            />
          )}

          {/* Live ink */}
          {drawnPath && (
            <path d={drawnPath} stroke="#c97a4a" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          )}
        </svg>
      </div>

      {/* Per-stroke tally */}
      <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', justifyContent: 'center' }}>
        {strokes.map((_, i) => {
          const isDone = accepted.includes(i)
          const isCurrent = i === strokeIndex && !finished
          return (
            <span
              key={i}
              title={`Stroke ${i + 1}`}
              style={{
                width: 24, height: 24, borderRadius: '50%',
                display: 'grid', placeItems: 'center',
                fontSize: '0.7rem', fontWeight: 700,
                background: isDone ? '#059669' : isCurrent ? 'var(--terracotta)' : 'rgba(201,122,74,0.15)',
                color: isDone || isCurrent ? '#fff' : 'var(--muted-plum)',
              }}
            >
              {isDone ? '✓' : i + 1}
            </span>
          )
        })}
      </div>

      {feedback && (
        <div
          className={feedback.ok ? 'notice notice-green' : 'notice notice-gold'}
          style={{ width: '100%', fontSize: '0.82rem' }}
        >
          {feedback.message}
        </div>
      )}

      <div className="stroke-controls">
        <button
          type="button"
          className="secondary-btn btn-sm"
          onClick={() => setHintFor(strokeIndex)}
          disabled={finished}
        >
          👁 Show me
        </button>
        <button type="button" className="ghost-btn btn-sm" onClick={undo} disabled={accepted.length === 0}>
          ↩ Undo
        </button>
        <button type="button" className="ghost-btn btn-sm" onClick={clearAll} disabled={accepted.length === 0 && !feedback}>
          Clear
        </button>
      </div>

      {attempts > 0 && (
        <p style={{ fontSize: '0.75rem', color: 'var(--muted-plum)' }}>
          {attempts - misses} of {attempts} attempts clean
        </p>
      )}
    </div>
  )
}
