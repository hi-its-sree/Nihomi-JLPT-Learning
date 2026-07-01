import { motion } from 'framer-motion'
import { Link, useParams } from 'react-router-dom'

const LEVEL_DATA = {
  N5: { title: 'Beginner', jp: '初級', color: '#059669', kanji: 100, vocab: 800, grammar: 50,
    topics: ['Basic hiragana & katakana', 'Numbers and counters', 'Daily greetings', 'Time expressions', 'Basic sentence structure (は、が、を)', 'Family vocabulary', 'Colors and directions', 'Basic verb conjugation'] },
  N4: { title: 'Elementary', jp: '基礎', color: '#0284c7', kanji: 300, vocab: 1500, grammar: 100,
    topics: ['て-form verbs', 'Conditional forms (〜たら、〜と)', 'Potential form', 'Giving and receiving', 'Passive voice basics', 'Short reading comprehension', 'Everyday conversation topics'] },
  N3: { title: 'Intermediate', jp: '中級', color: '#7c3aed', kanji: 650, vocab: 3750, grammar: 200,
    topics: ['Complex verb forms', 'Causative-passive', 'Conjunctions (〜のに、〜ために)', 'Formal and informal registers', 'News and editorial reading', 'Extended listening passages', 'Idiomatic expressions'] },
  N2: { title: 'Upper-Intermediate', jp: '上中級', color: '#b45309', kanji: 1000, vocab: 6000, grammar: 300,
    topics: ['Business Japanese', 'Formal written style', 'Complex conditionals', 'Nominalisation patterns', 'Newspaper articles', 'Long listening passages', 'Advanced grammar patterns'] },
  N1: { title: 'Advanced', jp: '上級', color: '#be123c', kanji: 2136, vocab: 10000, grammar: 450,
    topics: ['Literary Japanese', 'Classical grammar elements', 'Academic and technical texts', 'Nuanced expression', 'Advanced idiomatic usage', 'Political and cultural commentary', 'Full-length reading passages'] },
}

const SECTIONS = [
  { icon: '字', label: 'Kanji',      basePath: 'kanji',      desc: 'Stroke order, readings, and tracing practice' },
  { icon: '語', label: 'Vocabulary', basePath: 'vocabulary', desc: 'SRS flashcards and contextual examples' },
  { icon: '文', label: 'Grammar',    basePath: 'grammar',    desc: 'Pattern explanations and interactive drills' },
  { icon: '📖', label: 'Reading',    basePath: 'practice',   desc: 'Graded passages with comprehension questions' },
  { icon: '👂', label: 'Listening',  basePath: 'practice',   desc: 'Audio passages and answer practice' },
  { icon: '📋', label: 'Mock Test',  basePath: 'tests',      desc: 'Full-format timed practice exam' },
]

export default function LevelDetailPage() {
  const { levelId } = useParams()
  const code = levelId?.toUpperCase() ?? 'N3'
  const lvl  = LEVEL_DATA[code] ?? LEVEL_DATA.N3

  return (
    <div className="page-shell">

      {/* Header card */}
      <motion.div
        className="clay-card clay-card--lg"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ borderLeft: `4px solid ${lvl.color}`, position: 'relative', overflow: 'hidden' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16, flexWrap: 'wrap' }}>
          <div style={{
            background: `linear-gradient(135deg, ${lvl.color}, ${lvl.color}cc)`,
            color: 'white', fontWeight: 900, fontSize: '1.8rem',
            borderRadius: 16, padding: '10px 22px',
            boxShadow: `0 6px 20px ${lvl.color}45`,
          }}>
            {code}
          </div>
          <div>
            <h1 className="page-title">{lvl.title}</h1>
            <p style={{ color: 'var(--muted-plum)', fontSize: '0.9rem', marginTop: 2 }}>{lvl.jp} · JLPT {code}</p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 28, flexWrap: 'wrap', marginBottom: 20 }}>
          {[
            { label: 'Kanji',   val: lvl.kanji.toLocaleString() },
            { label: 'Vocab',   val: lvl.vocab.toLocaleString() },
            { label: 'Grammar', val: lvl.grammar },
          ].map(m => (
            <div key={m.label}>
              <div style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--dark-ink)' }}>{m.val}</div>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--muted-plum)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{m.label}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <Link to="/lessons"  className="primary-btn">Start Lessons →</Link>
          <Link to="/tests"    className="secondary-btn">Take Mock Test</Link>
          <Link to="/levels"   className="ghost-btn">← All Levels</Link>
        </div>

        <span style={{ position: 'absolute', right: 24, top: '50%', transform: 'translateY(-50%)', fontSize: '7rem', fontWeight: 900, color: `${lvl.color}12`, pointerEvents: 'none', userSelect: 'none' }}>
          {code}
        </span>
      </motion.div>

      {/* Curriculum sections */}
      <div>
        <div className="section-header" style={{ marginBottom: 16 }}>
          <span className="section-title">Curriculum Sections</span>
        </div>
        <div className="grid-3">
          {SECTIONS.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.07 }}
            >
              <Link to={`/${s.basePath}/${code}`} className="content-card" style={{ textDecoration: 'none', display: 'block' }}>
                <div style={{ fontSize: '2rem', marginBottom: 10 }}>{s.icon}</div>
                <h3>{s.label}</h3>
                <p style={{ marginTop: 4 }}>{s.desc}</p>
                <div style={{ marginTop: 14, color: 'var(--terracotta)', fontSize: '0.82rem', fontWeight: 700 }}>
                  Study now →
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Topics covered */}
      <motion.div
        className="clay-card"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <div className="section-title" style={{ marginBottom: 16 }}>Topics Covered at {code}</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 10 }}>
          {lvl.topics.map((t, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 12, background: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.7)' }}>
              <span style={{ color: lvl.color, fontWeight: 700 }}>✓</span>
              <span style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--dark-ink)' }}>{t}</span>
            </div>
          ))}
        </div>
      </motion.div>

    </div>
  )
}
