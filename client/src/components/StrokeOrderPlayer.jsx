import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'

// Animated stroke-order playback on a 0-200 viewBox, driven by the KanjiVG
// paths from lib/kanjiStrokeData.mjs. Shared by the Kanji detail page and the
// Stroke Practice drill.
export default function StrokeOrderPlayer({ strokes = [], compact = false }) {
  const [current, setCurrent] = useState(-1)  // -1 = show all faded
  const [playing, setPlaying] = useState(false)
  const [done, setDone]       = useState(false)
  const timerRef = useRef(null)

  // A new character arrives while a playback timer is still pending — drop the
  // timer, otherwise it advances into the *next* kanji's stroke list.
  useEffect(() => {
    clearTimeout(timerRef.current)
    setCurrent(-1)
    setPlaying(false)
    setDone(false)
  }, [strokes])

  useEffect(() => () => clearTimeout(timerRef.current), [])

  function play() {
    setDone(false)
    setPlaying(true)
    setCurrent(0)
    let i = 0
    function next() {
      i++
      if (i < strokes.length) {
        setCurrent(i)
        timerRef.current = setTimeout(next, 600)
      } else {
        setPlaying(false)
        setDone(true)
      }
    }
    timerRef.current = setTimeout(next, 600)
  }

  function reset() {
    clearTimeout(timerRef.current)
    setCurrent(-1)
    setPlaying(false)
    setDone(false)
  }

  return (
    <div className="stroke-player">
      <p style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--muted-plum)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
        Stroke Order — {strokes.length} strokes
      </p>

      <div className="stroke-canvas">
        {/* Grid lines */}
        <svg viewBox="0 0 200 200" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
          <line x1="100" y1="0" x2="100" y2="200" stroke="rgba(201,122,74,0.08)" strokeWidth="1" strokeDasharray="4,4"/>
          <line x1="0" y1="100" x2="200" y2="100" stroke="rgba(201,122,74,0.08)" strokeWidth="1" strokeDasharray="4,4"/>
        </svg>

        {/* Strokes */}
        <svg viewBox="0 0 200 200" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
          {strokes.map((path, i) => {
            const isActive   = current === i
            const isComplete = current > i || done
            return (
              <motion.path
                key={i}
                d={path}
                stroke={isComplete ? '#2f2a24' : isActive ? '#c97a4a' : 'rgba(150,130,110,0.18)'}
                strokeWidth={isActive ? 10 : 8}
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
                initial={false}
                animate={{
                  pathLength: (isComplete || isActive) ? 1 : 0,
                  filter: isActive ? 'drop-shadow(0 0 6px rgba(201,122,74,0.8))' : 'none',
                }}
                transition={{ duration: isActive ? 0.5 : 0.1, ease: 'easeOut' }}
              />
            )
          })}

          {/* Stroke number indicators */}
          {current >= 0 && !done && (
            <text x="10" y="195" fontSize="11" fill="rgba(201,122,74,0.7)" fontWeight="700">
              {current + 1} / {strokes.length}
            </text>
          )}
          {done && (
            <text x="10" y="195" fontSize="11" fill="#059669" fontWeight="700">
              Complete ✓
            </text>
          )}
        </svg>
      </div>

      <div className="stroke-controls">
        <button className="secondary-btn btn-sm" onClick={playing ? reset : play}>
          {playing ? '⏹ Stop' : done ? '↺ Replay' : '▶ Play'}
        </button>
        <button className="ghost-btn btn-sm" onClick={reset}>Reset</button>
        {!compact && strokes.map((_, i) => (
          <button
            key={i}
            onClick={() => { reset(); setCurrent(i); setDone(i === strokes.length - 1); }}
            style={{
              width: 28, height: 28, borderRadius: '50%', border: 'none',
              background: current >= i ? 'var(--terracotta)' : 'rgba(201,122,74,0.15)',
              color: current >= i ? 'white' : 'var(--muted-plum)',
              fontWeight: 700, fontSize: '0.72rem', cursor: 'pointer',
              transition: 'all 200ms',
            }}
          >
            {i + 1}
          </button>
        ))}
      </div>
    </div>
  )
}
