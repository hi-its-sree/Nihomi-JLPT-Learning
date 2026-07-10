import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { Link } from 'react-router-dom'
import { CHAPTER_ORDER, CHAPTERS } from '../../pages/journey/content/chapters'

function ProgressRing({ progress, color, size = 48 }) {
  const r = (size - 8) / 2
  const circ = 2 * Math.PI * r
  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)', flexShrink: 0 }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(0,0,0,0.07)" strokeWidth={4} />
      <motion.circle
        cx={size / 2} cy={size / 2} r={r}
        fill="none" stroke={color} strokeWidth={4} strokeLinecap="round"
        strokeDasharray={circ}
        initial={{ strokeDashoffset: circ }}
        animate={{ strokeDashoffset: circ - (progress / 100) * circ }}
        transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
      />
    </svg>
  )
}

function ChapterNode({ chapter, index, status }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-40px' })
  const isLocked = status === 'locked'
  const isCurrent = status === 'current'
  const isComplete = status === 'complete'

  return (
    <div ref={ref} style={{ display: 'flex', alignItems: 'flex-start', position: 'relative', marginBottom: 4 }}>
      <div style={{ position: 'absolute', left: -44, top: 20, zIndex: 2 }}>
        {isCurrent && [1, 2].map((n) => (
          <motion.div key={n} style={{ position: 'absolute', inset: -n * 8, borderRadius: '50%', border: `2px solid ${chapter.color}`, opacity: 0 }}
            animate={{ opacity: [0, 0.4, 0], scale: [0.8, 1.5, 1.9] }}
            transition={{ duration: 2.2, repeat: Infinity, delay: n * 0.7 }}
          />
        ))}
        <motion.div
          style={{
            width: 32, height: 32, borderRadius: '50%',
            background: isLocked ? 'rgba(180,180,180,0.15)' : `linear-gradient(135deg, ${chapter.color}, var(--accent))`,
            border: `3px solid ${isLocked ? 'rgba(150,150,150,0.25)' : chapter.color}`,
            display: 'grid', placeItems: 'center', fontSize: '0.9rem',
            boxShadow: isLocked ? 'none' : `0 0 16px ${chapter.color}55`,
          }}
          initial={{ scale: 0, opacity: 0 }}
          animate={inView ? { scale: 1, opacity: 1 } : {}}
          transition={{ type: 'spring', stiffness: 260, delay: 0.05 }}
        >
          {isComplete ? '✓' : isLocked ? '🔒' : chapter.icon}
        </motion.div>
      </div>

      <motion.div
        style={{ flex: 1, opacity: isLocked ? 0.6 : 1 }}
        initial={{ opacity: 0, x: index % 2 === 0 ? -24 : 24 }}
        animate={inView ? { opacity: isLocked ? 0.6 : 1, x: 0 } : {}}
        transition={{ duration: 0.45, delay: 0.05 }}
      >
        <div className="clay-card clay-card--sm" style={{ borderLeft: `4px solid ${isLocked ? 'rgba(150,150,150,0.18)' : chapter.color}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <ProgressRing progress={isComplete ? 100 : 0} color={chapter.color} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <span style={{ fontWeight: 800, fontSize: '0.95rem', color: isLocked ? 'var(--muted-plum)' : 'var(--dark-ink)' }}>{chapter.title}</span>
                {isCurrent && <span style={{ fontSize: '0.65rem', fontWeight: 800, padding: '2px 9px', borderRadius: 999, background: `linear-gradient(135deg, ${chapter.color}, var(--accent))`, color: 'white' }}>✦ Continue</span>}
                {isComplete && <span style={{ fontSize: '0.65rem', fontWeight: 800, padding: '2px 9px', borderRadius: 999, background: 'rgba(5,150,105,0.12)', color: '#059669' }}>✓ Complete</span>}
              </div>
              <p style={{ fontSize: '0.78rem', color: 'var(--muted-plum)', marginTop: 4 }}>{chapter.summary}</p>
            </div>
            {!isLocked && (
              <Link to={chapter.route} className="secondary-btn btn-sm" style={{ flexShrink: 0 }}>
                {isComplete ? 'Review' : 'Start'} →
              </Link>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default function ChapterMap({ journeyState }) {
  return (
    <div style={{ position: 'relative', paddingLeft: 56 }}>
      <motion.div
        style={{
          position: 'absolute', left: 17, top: 18, bottom: 18, width: 3, borderRadius: 999,
          background: 'linear-gradient(to bottom, #c97a4a 0%, #059669 20%, #0284c7 40%, #db2777 55%, #7c3aed 70%, #b45309 85%, #be123c 100%)',
        }}
        initial={{ scaleY: 0, originY: '0%' }}
        animate={{ scaleY: 1 }}
        transition={{ duration: 1.6, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
      />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        {CHAPTER_ORDER.map((id, index) => {
          const chapter = CHAPTERS[id]
          const isComplete = journeyState.completedChapters.includes(id)
          const previousId = CHAPTER_ORDER[index - 1]
          const isUnlocked = index === 0 || isComplete || journeyState.completedChapters.includes(previousId)
          const status = isComplete ? 'complete' : isUnlocked ? 'current' : 'locked'
          return <ChapterNode key={id} chapter={chapter} index={index} status={status} />
        })}
      </div>
    </div>
  )
}
