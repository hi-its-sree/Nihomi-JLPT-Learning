import { motion } from 'framer-motion'
import { CHAPTER_ORDER } from '../../pages/journey/content/chapters'

export default function ChapterHeader({ chapter }) {
  const stepIndex = CHAPTER_ORDER.indexOf(chapter.id)

  return (
    <motion.div className="clay-card clay-card--lg"
      initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
      style={{ position: 'relative', overflow: 'hidden' }}
    >
      <p className="eyebrow">Chapter {stepIndex + 1} of {CHAPTER_ORDER.length}</p>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 8, flexWrap: 'wrap' }}>
        <span style={{ fontSize: '2.4rem' }}>{chapter.icon}</span>
        <div>
          <h1 className="page-title" style={{ fontSize: 'clamp(1.5rem, 3vw, 2.2rem)' }}>{chapter.title}</h1>
          <p style={{ color: 'var(--muted-plum)', fontSize: '0.85rem', fontWeight: 600, marginTop: 2 }}>{chapter.jp}</p>
        </div>
      </div>
      <p className="page-subtitle" style={{ marginTop: 12 }}>{chapter.summary}</p>

      <div style={{ display: 'flex', gap: 3, marginTop: 20 }}>
        {CHAPTER_ORDER.map((id, i) => (
          <motion.div key={id}
            style={{
              flex: 1, height: 5, borderRadius: 999,
              background: i <= stepIndex ? `linear-gradient(90deg, ${chapter.color}, var(--accent))` : 'rgba(0,0,0,0.08)',
            }}
            initial={{ scaleX: 0, originX: '0%' }} animate={{ scaleX: 1 }}
            transition={{ delay: 0.1 + i * 0.03, duration: 0.4 }}
          />
        ))}
      </div>

      <span style={{ position: 'absolute', right: 20, top: '50%', transform: 'translateY(-50%)', fontSize: '7rem', fontWeight: 900, color: `${chapter.color}0c`, pointerEvents: 'none', userSelect: 'none' }}>
        {chapter.icon}
      </span>
    </motion.div>
  )
}
