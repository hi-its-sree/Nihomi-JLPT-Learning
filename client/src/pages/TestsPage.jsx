import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link, useParams } from 'react-router-dom'

const LEVEL_RE = /^N[1-5]$/i

const TESTS = [
  { id: 't1', level: 'N3', title: 'N3 Full Mock Test #1', sections: ['Vocabulary', 'Grammar', 'Reading', 'Listening'], duration: 105, questions: 62, lastScore: 74, taken: true,  date: '2026-06-22' },
  { id: 't2', level: 'N3', title: 'N3 Vocabulary Section', sections: ['Vocabulary'], duration: 25, questions: 20, lastScore: 85, taken: true,  date: '2026-06-25' },
  { id: 't3', level: 'N3', title: 'N3 Reading Focused',    sections: ['Reading'],    duration: 40, questions: 18, lastScore: null, taken: false },
  { id: 't4', level: 'N4', title: 'N4 Full Mock Test #1', sections: ['Vocabulary', 'Grammar', 'Reading', 'Listening'], duration: 90, questions: 55, lastScore: 92, taken: true,  date: '2026-06-10' },
  { id: 't5', level: 'N5', title: 'N5 Complete Review',    sections: ['Vocabulary', 'Grammar', 'Reading'], duration: 60, questions: 38, lastScore: 96, taken: true,  date: '2026-05-30' },
  { id: 't6', level: 'N2', title: 'N2 Grammar Section',    sections: ['Grammar'],    duration: 35, questions: 22, lastScore: null, taken: false },
]

const LEVEL_COLORS = { N5: '#059669', N4: '#0284c7', N3: '#7c3aed', N2: '#b45309', N1: '#be123c' }

const SAMPLE_QUESTIONS = [
  { id: 1, text: '田中さんは毎日図書館で（　）を勉強しています。', options: ['日本語', 'にほんご', '日本吾', 'にほんこ'], correct: 0 },
  { id: 2, text: 'この映画は（　）面白いですね。', options: ['とても', 'あまり', 'まだ', 'もっと'], correct: 0 },
  { id: 3, text: '明日、友達と（　）つもりです。', options: ['会う', 'あう', '合う', 'あいます'], correct: 0 },
]

function MockTestSession({ test, onExit }) {
  const [q, setQ]             = useState(0)
  const [selected, setSelected] = useState(null)
  const [answered, setAnswered] = useState([])
  const [finished, setFinished] = useState(false)
  const current = SAMPLE_QUESTIONS[q] ?? SAMPLE_QUESTIONS[0]
  const score = answered.length > 0
    ? Math.round((answered.filter(a => a.correct).length / answered.length) * 100)
    : 0

  function next() {
    if (selected === null) return
    const isCorrect = selected === current.correct
    const next = [...answered, { qId: current.id, selected, correct: isCorrect }]
    setAnswered(next)
    if (q + 1 >= SAMPLE_QUESTIONS.length) { setFinished(true) }
    else { setQ(p => p + 1); setSelected(null) }
  }

  if (finished) {
    const final = Math.round((answered.filter(a => a.correct).length / SAMPLE_QUESTIONS.length) * 100)
    return (
      <div className="page-shell">
        <motion.div className="clay-card clay-card--lg" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} style={{ textAlign: 'center', maxWidth: 560, margin: '0 auto' }}>
          <div style={{ fontSize: '3.5rem', marginBottom: 8 }}>{final >= 70 ? '🎉' : '📚'}</div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--dark-ink)' }}>Test Complete!</h2>
          <div style={{ fontSize: '3rem', fontWeight: 900, color: final >= 70 ? '#059669' : '#c97a4a', margin: '12px 0' }}>{final}%</div>
          <p style={{ color: 'var(--muted-plum)', lineHeight: 1.6 }}>
            {final >= 70 ? 'Excellent! You are on track for JLPT success.' : 'Good effort — review incorrect answers and keep practicing.'}
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, margin: '20px 0' }}>
            {[{ label: 'Correct', val: answered.filter(a => a.correct).length }, { label: 'Incorrect', val: answered.filter(a => !a.correct).length }, { label: 'Score', val: `${final}%` }].map(s => (
              <div key={s.label} style={{ padding: 14, borderRadius: 16, background: 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.8)' }}>
                <div style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--dark-ink)' }}>{s.val}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--muted-plum)', fontWeight: 600 }}>{s.label}</div>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="primary-btn" onClick={onExit}>Back to Tests</button>
            <Link to="/progress" className="secondary-btn">View Analytics</Link>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="page-shell">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
        <div>
          <p className="eyebrow">Mock Test · {test.level}</p>
          <h1 className="page-title" style={{ fontSize: '1.4rem', marginTop: 4 }}>{test.title}</h1>
        </div>
        <button className="ghost-btn btn-sm" onClick={onExit}>✕ Exit</button>
      </div>

      <div className="progress-bar-wrap">
        <motion.div className="progress-bar-fill" animate={{ width: `${(q / SAMPLE_QUESTIONS.length) * 100}%` }} transition={{ duration: 0.4 }} />
      </div>

      <div className="test-card">
        <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
          <span className={`badge badge-${test.level.toLowerCase()}`}>{test.level}</span>
          <span style={{ fontSize: '0.78rem', color: 'var(--muted-plum)', fontWeight: 600 }}>Question {q + 1} of {SAMPLE_QUESTIONS.length}</span>
        </div>
        <div className="test-question">{current.text}</div>
        <div className="test-options">
          {current.options.map((opt, i) => (
            <button key={i} className={`test-option ${selected === i ? 'selected' : ''}`} onClick={() => setSelected(i)}>
              <span style={{ marginRight: 10, color: 'var(--muted-plum)', fontWeight: 700, fontSize: '0.82rem' }}>{String.fromCharCode(65 + i)}.</span>
              {opt}
            </button>
          ))}
        </div>
        <motion.button className="primary-btn" onClick={next} disabled={selected === null} style={{ marginTop: 8, opacity: selected === null ? 0.5 : 1 }} whileHover={{ scale: 1.01 }}>
          {q + 1 >= SAMPLE_QUESTIONS.length ? 'Finish Test' : 'Next Question →'}
        </motion.button>
      </div>
    </div>
  )
}

export default function TestsPage() {
  const { levelOrId } = useParams()
  const levelParam = levelOrId && LEVEL_RE.test(levelOrId) ? levelOrId.toUpperCase() : null
  const levelColor = levelParam ? LEVEL_COLORS[levelParam] : 'var(--terracotta)'

  const [activeTest, setActiveTest] = useState(null)
  if (activeTest) return <MockTestSession test={activeTest} onExit={() => setActiveTest(null)} />

  const visibleTests = levelParam ? TESTS.filter(t => t.level === levelParam) : TESTS

  return (
    <div className="page-shell">
      <motion.div className="clay-card clay-card--lg" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} style={{ position: 'relative', overflow: 'hidden' }}>
        {levelParam && (
          <Link to="/tests" className="ghost-btn btn-sm" style={{ marginBottom: 12, display: 'inline-flex' }}>
            ← All Tests
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
          <p className="eyebrow">Mock Exam Center</p>
        </div>
        <h1 className="page-title" style={{ marginTop: 8 }}>
          {levelParam ? `${levelParam} Mock Tests` : 'JLPT Mock Tests'}
        </h1>
        <p className="page-subtitle" style={{ marginTop: 10 }}>
          {levelParam
            ? `Full-format and section-specific ${levelParam} exams. Track your readiness and review weak areas.`
            : 'Full-format timed exams, focused section practice, and readiness analytics. Start any test and get instant feedback.'}
        </p>
        <div style={{ marginTop: 16, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <Link to="/progress" className="secondary-btn">Test history →</Link>
        </div>
        <span style={{ position: 'absolute', right: 24, top: '50%', transform: 'translateY(-50%)', fontSize: '7rem', fontWeight: 900, color: 'rgba(201,122,74,0.05)', pointerEvents: 'none' }}>試</span>
      </motion.div>

      {visibleTests.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px 24px', color: 'var(--muted-plum)' }}>
          <div style={{ fontSize: '3rem', marginBottom: 12 }}>📋</div>
          <p style={{ fontWeight: 600 }}>No tests available for {levelParam} yet. Check back soon!</p>
        </div>
      )}

      <div className="grid-2">
        {visibleTests.map((t, i) => {
          const color = LEVEL_COLORS[t.level] ?? 'var(--terracotta)'
          return (
            <motion.div key={t.id} className="content-card" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
              <div style={{ display: 'flex', gap: 8, marginBottom: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                <span style={{ background: `${color}18`, color, fontWeight: 800, fontSize: '0.85rem', padding: '4px 10px', borderRadius: 8 }}>{t.level}</span>
                {t.taken && <span style={{ fontSize: '0.72rem', color: '#059669', fontWeight: 700, background: 'rgba(52,211,153,0.12)', padding: '2px 8px', borderRadius: 999 }}>Completed</span>}
              </div>
              <h3 style={{ marginBottom: 6 }}>{t.title}</h3>
              <div style={{ display: 'flex', gap: 16, marginBottom: 10, flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--muted-plum)' }}>⏱ {t.duration} min</span>
                <span style={{ fontSize: '0.78rem', color: 'var(--muted-plum)' }}>❓ {t.questions} questions</span>
              </div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14 }}>
                {t.sections.map(s => (
                  <span key={s} style={{ fontSize: '0.7rem', fontWeight: 700, padding: '2px 8px', borderRadius: 999, background: `${color}10`, color }}>{s}</span>
                ))}
              </div>
              {t.taken && t.lastScore !== null && (
                <div style={{ marginBottom: 12 }}>
                  <div className="progress-bar-wrap">
                    <motion.div className="progress-bar-fill" style={{ background: `linear-gradient(90deg, ${color}, ${color}aa)` }} initial={{ width: 0 }} animate={{ width: `${t.lastScore}%` }} transition={{ duration: 1 }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--muted-plum)' }}>Score: {t.lastScore}%</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--muted-plum)' }}>{t.date}</span>
                  </div>
                </div>
              )}
              <motion.button className="primary-btn btn-sm" onClick={() => setActiveTest(t)} style={{ background: `linear-gradient(135deg, ${color}, ${color}cc)` }} whileHover={{ scale: 1.02 }}>
                {t.taken ? 'Retake Test' : 'Start Test →'}
              </motion.button>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
