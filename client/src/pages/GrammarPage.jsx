import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link, useParams } from 'react-router-dom'

const GRAMMAR = [
  {
    pattern: '〜たい',      level: 'N5',
    meaning: 'Want to do…',
    structure: 'Verb stem + たい',
    example: '日本語を話したい。',
    translation: 'I want to speak Japanese.',
    note: 'Used to express the speaker\'s desire to perform an action. Changes like an i-adjective.',
    conjugations: ['食べたい (want to eat)', '行きたい (want to go)', '見たい (want to see)'],
  },
  {
    pattern: '〜ている',     level: 'N5',
    meaning: 'Is doing / is in a state of…',
    structure: 'Verb て-form + いる',
    example: '今、本を読んでいます。',
    translation: 'I am reading a book now.',
    note: 'Expresses ongoing actions or resulting states. Contracted to 〜てる in casual speech.',
    conjugations: ['食べている (is eating)', '寝ている (is sleeping)', '結婚している (is married)'],
  },
  {
    pattern: '〜ほうがいい', level: 'N4',
    meaning: 'It is better to… / You should…',
    structure: 'Verb past plain + ほうがいい',
    example: '早く寝たほうがいいよ。',
    translation: 'You should sleep early.',
    note: 'Gives advice. Affirmative uses past plain form; negative uses ない + ほうがいい.',
    conjugations: ['行ったほうがいい (should go)', '飲まないほうがいい (should not drink)'],
  },
  {
    pattern: '〜てしまう',   level: 'N3',
    meaning: 'Ended up doing / unfortunately did…',
    structure: 'Verb て-form + しまう',
    example: '財布を忘れてしまった。',
    translation: 'I accidentally left my wallet behind.',
    note: 'Expresses completion, often with regret or an unintended result. Casual: 〜ちゃう.',
    conjugations: ['食べてしまった (ended up eating)', 'なくしてしまった (unfortunately lost)'],
  },
  {
    pattern: '〜ために',     level: 'N3',
    meaning: 'In order to / for the purpose of…',
    structure: 'Verb dictionary form + ために',
    example: '日本語を覚えるために、毎日練習します。',
    translation: 'I practice every day in order to learn Japanese.',
    note: 'Expresses purpose. Use 〜のために with nouns. Different from 〜から (cause) or 〜ので (reason).',
    conjugations: ['試験に合格するために (to pass the exam)', '健康のために (for health)'],
  },
  {
    pattern: '〜にもかかわらず', level: 'N2',
    meaning: 'Despite / in spite of…',
    structure: 'Noun / Verb plain + にもかかわらず',
    example: '雨にもかかわらず、試合を続けた。',
    translation: 'Despite the rain, the game continued.',
    note: 'Formal written style. Emphasizes the contrast between expectation and result.',
    conjugations: ['困難にもかかわらず (despite difficulties)', '反対にもかかわらず (despite opposition)'],
  },
]

const LEVELS = ['All', 'N5', 'N4', 'N3', 'N2', 'N1']
const LEVEL_COLORS = { N5: '#059669', N4: '#0284c7', N3: '#7c3aed', N2: '#b45309', N1: '#be123c' }
const LEVEL_RE = /^N[1-5]$/i

function GrammarCard({ g, expanded, onToggle }) {
  const color = LEVEL_COLORS[g.level] ?? 'var(--terracotta)'
  return (
    <motion.div
      className="content-card"
      layout
      style={{ cursor: 'pointer', borderLeft: expanded ? `3px solid ${color}` : '1px solid rgba(255,255,255,0.8)' }}
      onClick={onToggle}
    >
      <div style={{ display: 'flex', align: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
        <div>
          <div style={{ fontSize: '1.3rem', fontWeight: 900, color: 'var(--dark-ink)', marginBottom: 4 }}>{g.pattern}</div>
          <div style={{ fontSize: '0.9rem', color: 'var(--muted-plum)' }}>{g.meaning}</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'flex-end', flexShrink: 0 }}>
          <span className={`badge badge-${g.level.toLowerCase()}`}>{g.level}</span>
          <span style={{ fontSize: '0.72rem', color: 'var(--terracotta)', fontWeight: 700 }}>{expanded ? '▲' : '▼'}</span>
        </div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            style={{ overflow: 'hidden' }}
            onClick={e => e.stopPropagation()}
          >
            <hr className="divider" style={{ margin: '14px 0' }} />

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--muted-plum)', marginBottom: 4 }}>Structure</div>
                <div style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--dark-ink)', fontFamily: 'var(--font-mono)', padding: '8px 12px', background: 'rgba(201,122,74,0.06)', borderRadius: 10 }}>{g.structure}</div>
              </div>

              <div>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--muted-plum)', marginBottom: 6 }}>Example</div>
                <div style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--dark-ink)' }}>{g.example}</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--muted-plum)', marginTop: 4 }}>{g.translation}</div>
              </div>

              <div className="notice notice-gold">{g.note}</div>

              <div>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--muted-plum)', marginBottom: 6 }}>More examples</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {g.conjugations.map(c => (
                    <div key={c} style={{ fontSize: '0.85rem', color: 'var(--dark-ink)', padding: '6px 10px', borderRadius: 8, background: 'rgba(255,255,255,0.6)' }}>
                      • {c}
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', gap: 8 }}>
                <Link to="/practice" className="primary-btn btn-sm" onClick={e => e.stopPropagation()}>Practice drill</Link>
                <Link to="/flashcards" className="ghost-btn btn-sm" onClick={e => e.stopPropagation()}>Add to SRS</Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default function GrammarPage() {
  const { levelOrId } = useParams()
  const levelParam = levelOrId && LEVEL_RE.test(levelOrId) ? levelOrId.toUpperCase() : null

  const [activeLevel, setActiveLevel] = useState(levelParam ?? 'All')
  const [search, setSearch]           = useState('')
  const [expanded, setExpanded]       = useState(null)

  const effectiveLevel = levelParam ?? activeLevel

  const filtered = GRAMMAR.filter(g => {
    const matchLevel = effectiveLevel === 'All' || g.level === effectiveLevel
    const q = search.toLowerCase()
    const matchSearch = !q || g.pattern.includes(q) || g.meaning.toLowerCase().includes(q)
    return matchLevel && matchSearch
  })

  return (
    <div className="page-shell">

      <motion.div className="clay-card" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        {levelParam && (
          <Link to="/grammar" className="ghost-btn btn-sm" style={{ marginBottom: 12, display: 'inline-flex' }}>
            ← All Grammar
          </Link>
        )}
        <p className="eyebrow">Grammar Library</p>
        <h1 className="page-title" style={{ marginTop: 8 }}>
          {levelParam ? `${levelParam} Grammar Patterns` : 'Master Grammar Patterns'}
        </h1>
        <p className="page-subtitle" style={{ marginTop: 10 }}>
          {levelParam
            ? `All ${levelParam} grammar patterns with structure, examples, and drill exercises.`
            : 'Each pattern with structure, example sentences, usage notes, and drill exercises. Tap a card to expand its full explanation.'}
        </p>
        <div style={{ marginTop: 16, display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          <input
            className="field-input"
            placeholder="Search patterns or meanings…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ flex: '1 1 240px', maxWidth: 360 }}
          />
          <Link to="/practice" className="secondary-btn">Grammar Drills →</Link>
        </div>
      </motion.div>

      <div className="filter-bar">
        {!levelParam && LEVELS.map(l => (
          <button key={l} className={`filter-pill ${activeLevel === l ? 'active' : ''}`} onClick={() => setActiveLevel(l)}>{l}</button>
        ))}
        {levelParam && (
          <span
            className="filter-pill active"
            style={{ background: LEVEL_COLORS[levelParam], color: '#fff', border: 'none' }}
          >
            {levelParam}
          </span>
        )}
        <span style={{ marginLeft: 'auto', fontSize: '0.82rem', color: 'var(--muted-plum)', fontWeight: 600 }}>{filtered.length} patterns</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {filtered.map((g, i) => (
          <motion.div key={g.pattern} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <GrammarCard
              g={g}
              expanded={expanded === g.pattern}
              onToggle={() => setExpanded(prev => prev === g.pattern ? null : g.pattern)}
            />
          </motion.div>
        ))}
      </div>

    </div>
  )
}
