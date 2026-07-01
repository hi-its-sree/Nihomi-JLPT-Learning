import { motion } from 'framer-motion'
import { Link, useParams } from 'react-router-dom'

const LEVEL_RE = /^N[1-5]$/i
const LEVEL_COLORS = { N5: '#059669', N4: '#0284c7', N3: '#7c3aed', N2: '#b45309', N1: '#be123c' }

const PRACTICE_MODES = [
  {
    icon: '字',
    title: 'Kanji Tracing',
    subtitle: '書き方練習',
    desc: 'Trace stroke-by-stroke on a digital canvas. Accuracy feedback on each stroke.',
    link: '/kanji',
    color: '#c97a4a',
    bg: 'rgba(201,122,74,0.10)',
    tags: ['Interactive', 'Stroke order'],
  },
  {
    icon: '🃏',
    title: 'Vocabulary SRS',
    subtitle: 'フラッシュカード',
    desc: 'Spaced repetition flashcards. Cards surface at optimal intervals based on your performance.',
    link: '/flashcards',
    color: '#7c3aed',
    bg: 'rgba(124,58,237,0.10)',
    tags: ['SRS', 'Adaptive'],
  },
  {
    icon: '文',
    title: 'Grammar Drills',
    subtitle: '文法練習',
    desc: 'Fill-in-the-blank and multiple-choice exercises for each grammar pattern.',
    link: '/grammar',
    color: '#0284c7',
    bg: 'rgba(2,132,199,0.10)',
    tags: ['Drills', 'All levels'],
  },
  {
    icon: '👂',
    title: 'Listening Practice',
    subtitle: 'リスニング練習',
    desc: 'Real JLPT-style audio passages with comprehension questions and transcripts.',
    link: '/practice/listening',
    color: '#059669',
    bg: 'rgba(5,150,105,0.10)',
    tags: ['Audio', 'Transcript'],
  },
  {
    icon: '📖',
    title: 'Reading Comprehension',
    subtitle: '読解練習',
    desc: 'Short and long-form passages at your JLPT level. Answer questions after reading.',
    link: '/practice/reading',
    color: '#be123c',
    bg: 'rgba(190,18,60,0.10)',
    tags: ['Graded texts', 'Q&A'],
  },
  {
    icon: '🎯',
    title: 'Weak Point Focus',
    subtitle: '弱点強化',
    desc: 'AI-detected weak areas from your test history. Targeted review for maximum improvement.',
    link: '/progress',
    color: '#b45309',
    bg: 'rgba(180,83,9,0.10)',
    tags: ['Adaptive', 'Smart review'],
  },
]

const DAILY_STATS = [
  { label: 'Reviewed', val: '34', unit: 'cards' },
  { label: 'Accuracy', val: '88', unit: '%' },
  { label: 'XP earned', val: '+120', unit: 'XP' },
  { label: 'Time',      val: '22', unit: 'min' },
]

export default function PracticePage() {
  const { levelOrId } = useParams()
  const levelParam = levelOrId && LEVEL_RE.test(levelOrId) ? levelOrId.toUpperCase() : null
  const levelColor = levelParam ? LEVEL_COLORS[levelParam] : 'var(--terracotta)'

  return (
    <div className="page-shell">

      {/* Header */}
      <motion.div
        className="clay-card clay-card--lg"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ position: 'relative', overflow: 'hidden' }}
      >
        {levelParam && (
          <Link to="/practice" className="ghost-btn btn-sm" style={{ marginBottom: 12, display: 'inline-flex' }}>
            ← All Practice
          </Link>
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          {levelParam && (
            <span style={{
              background: `linear-gradient(135deg, ${levelColor}, ${levelColor}cc)`,
              color: '#fff', fontWeight: 900, fontSize: '1.1rem',
              borderRadius: 12, padding: '6px 16px',
              boxShadow: `0 4px 12px ${levelColor}40`,
            }}>
              {levelParam}
            </span>
          )}
          <p className="eyebrow">Practice Hub</p>
        </div>
        <h1 className="page-title" style={{ marginTop: 8 }}>
          {levelParam ? `${levelParam} Practice Drills` : 'Daily Drills & Practice'}
        </h1>
        <p className="page-subtitle" style={{ marginTop: 10 }}>
          {levelParam
            ? `Practice modes focused on ${levelParam} content — kanji, vocabulary, grammar, and listening at your level.`
            : 'Targeted practice modes built around your weak points and SRS schedule. Every session moves you closer to JLPT readiness.'}
        </p>

        {/* Daily stats */}
        <div style={{ display: 'flex', gap: 20, marginTop: 20, flexWrap: 'wrap' }}>
          {DAILY_STATS.map(s => (
            <div key={s.label} style={{ display: 'flex', flex: 'column', gap: 2 }}>
              <div style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--dark-ink)' }}>
                {s.val}<span style={{ fontSize: '0.75rem', color: 'var(--muted-plum)', marginLeft: 2 }}>{s.unit}</span>
              </div>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--muted-plum)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>{s.label}</div>
            </div>
          ))}
        </div>

        <span style={{ position: 'absolute', right: 24, top: '50%', transform: 'translateY(-50%)', fontSize: '7rem', fontWeight: 900, color: 'rgba(201,122,74,0.05)', pointerEvents: 'none', userSelect: 'none' }}>練</span>
      </motion.div>

      {/* Practice modes */}
      <div>
        <div className="section-header" style={{ marginBottom: 16 }}>
          <span className="section-title">Practice Modes</span>
          <Link to="/study-plan" className="ghost-btn btn-sm">View study plan →</Link>
        </div>

        <div className="grid-3">
          {PRACTICE_MODES.map((m, i) => (
            <motion.div
              key={m.title}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.07 }}
            >
              <Link to={m.link} className="content-card" style={{ textDecoration: 'none', display: 'block', background: `linear-gradient(135deg, rgba(255,255,255,0.94), ${m.bg})` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                  <div style={{
                    width: 52, height: 52, borderRadius: 16,
                    background: `linear-gradient(135deg, ${m.color}22, ${m.color}10)`,
                    border: `1px solid ${m.color}30`,
                    display: 'grid', placeItems: 'center',
                    fontSize: '1.5rem', fontWeight: 900, color: m.color,
                  }}>
                    {m.icon}
                  </div>
                  <div>
                    <h3 style={{ color: 'var(--dark-ink)', marginBottom: 2 }}>{m.title}</h3>
                    <div style={{ fontSize: '0.78rem', color: m.color, fontWeight: 700 }}>{m.subtitle}</div>
                  </div>
                </div>

                <p style={{ fontSize: '0.85rem', color: 'var(--muted-plum)', lineHeight: 1.65 }}>{m.desc}</p>

                <div style={{ marginTop: 12, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {m.tags.map(t => (
                    <span key={t} style={{ fontSize: '0.68rem', fontWeight: 700, padding: '2px 8px', borderRadius: 999, background: `${m.color}14`, color: m.color }}>
                      {t}
                    </span>
                  ))}
                </div>

                <div style={{ marginTop: 14, color: m.color, fontSize: '0.82rem', fontWeight: 700 }}>Start practice →</div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Recommended */}
      <motion.div
        className="clay-card"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <div className="section-title" style={{ marginBottom: 16 }}>Recommended for You</div>
        <div className="notice notice-gold">
          <strong>Weak point detected</strong> — Your last mock test showed low accuracy in Listening (N3 section).
          We recommend 15 minutes of focused listening practice before your next test.
        </div>
        <div style={{ marginTop: 14, display: 'flex', gap: 10 }}>
          <Link to="/flashcards" className="primary-btn">Start listening drill</Link>
          <Link to="/progress"   className="secondary-btn">View analytics</Link>
        </div>
      </motion.div>

    </div>
  )
}
