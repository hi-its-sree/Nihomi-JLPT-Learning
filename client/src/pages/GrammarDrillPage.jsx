import { useCallback, useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link, useSearchParams } from 'react-router-dom'
import api from '../lib/api'

const LEVELS = ['N5', 'N4', 'N3', 'N2', 'N1']
const LENGTHS = [5, 10, 20]

const TYPE_LABELS = {
  cloze: 'Fill in the blank',
  meaning: 'Pattern → meaning',
  pattern: 'Meaning → pattern',
  structure: 'Structure',
}

export default function GrammarDrillPage() {
  const [searchParams, setSearchParams] = useSearchParams()

  const [level, setLevel] = useState(() => {
    const fromUrl = (searchParams.get('level') || '').toUpperCase()
    return LEVELS.includes(fromUrl) ? fromUrl : 'N5'
  })
  const [count, setCount] = useState(() => {
    const fromUrl = Number(searchParams.get('count'))
    return LENGTHS.includes(fromUrl) ? fromUrl : 10
  })

  const [questions, setQuestions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [index, setIndex] = useState(0)
  const [picked, setPicked] = useState(null)   // option index the user chose
  const [answers, setAnswers] = useState([])   // { question, picked, correct }
  const [done, setDone] = useState(false)

  const question = questions[index]

  useEffect(() => {
    setSearchParams({ level, count: String(count) }, { replace: true })
  }, [level, count, setSearchParams])

  const loadDrill = useCallback(async () => {
    setLoading(true)
    setError('')
    setIndex(0)
    setPicked(null)
    setAnswers([])
    setDone(false)
    try {
      const { data } = await api.get('/api/v1/practice/grammar', { params: { level, count } })
      setQuestions(data.questions ?? [])
      if ((data.questions ?? []).length === 0) {
        setError(`No grammar patterns available for ${level}.`)
      }
    } catch {
      setQuestions([])
      setError('Unable to build a grammar drill right now. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [level, count])

  useEffect(() => { loadDrill() }, [loadDrill])

  function choose(optionIndex) {
    if (picked !== null) return
    setPicked(optionIndex)
    setAnswers((prev) => [...prev, { question, picked: optionIndex, correct: optionIndex === question.correct }])
  }

  function next() {
    setPicked(null)
    if (index + 1 >= questions.length) setDone(true)
    else setIndex((i) => i + 1)
  }

  const score = answers.filter((a) => a.correct).length

  function renderControls() {
    return (
      <div className="filter-bar">
        {LEVELS.map((l) => (
          <button key={l} className={`filter-pill ${level === l ? 'active' : ''}`} onClick={() => setLevel(l)}>{l}</button>
        ))}
        <select
          className="field-input"
          value={count}
          onChange={(e) => setCount(Number(e.target.value))}
          style={{ padding: '7px 14px', fontSize: '0.82rem', fontWeight: 700, borderRadius: 999, width: 'auto' }}
        >
          {LENGTHS.map((n) => <option key={n} value={n}>{n} questions</option>)}
        </select>
        <Link to="/practice" className="ghost-btn btn-sm" style={{ marginLeft: 'auto' }}>← Practice</Link>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="page-shell">
        {renderControls()}
        <div className="clay-card clay-card--lg" style={{ textAlign: 'center', color: 'var(--muted-plum)' }}>
          Building your {level} grammar drill…
        </div>
      </div>
    )
  }

  if (error || questions.length === 0) {
    return (
      <div className="page-shell">
        {renderControls()}
        <div className="clay-card clay-card--lg" style={{ textAlign: 'center', maxWidth: 520, margin: '0 auto' }}>
          <div style={{ fontSize: '2.6rem', marginBottom: 12 }}>文</div>
          <h2 className="section-title" style={{ fontSize: '1.3rem' }}>Nothing to drill yet</h2>
          <p style={{ color: 'var(--muted-plum)', marginTop: 8, lineHeight: 1.6 }}>{error}</p>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 20 }}>
            <button className="primary-btn" onClick={loadDrill}>Try again</button>
            <Link to="/grammar" className="secondary-btn">Browse Grammar →</Link>
          </div>
        </div>
      </div>
    )
  }

  if (done) {
    const missed = answers.filter((a) => !a.correct)
    const pct = Math.round((score / answers.length) * 100)
    return (
      <div className="page-shell">
        {renderControls()}
        <motion.div className="clay-card clay-card--lg" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: 8 }}>{pct >= 80 ? '🎉' : pct >= 50 ? '💪' : '📚'}</div>
            <h2 className="section-title" style={{ fontSize: '1.5rem' }}>Drill complete</h2>
            <p style={{ color: 'var(--muted-plum)', marginTop: 8 }}>
              You scored <strong style={{ color: 'var(--dark-ink)' }}>{score} / {answers.length}</strong> ({pct}%) on {level} grammar.
            </p>
          </div>

          {missed.length > 0 && (
            <>
              <hr className="divider" style={{ margin: '18px 0' }} />
              <div className="section-title" style={{ marginBottom: 12, fontSize: '1rem' }}>Worth reviewing</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {missed.map((a, i) => (
                  <div key={i} className="content-card" style={{ padding: '12px 14px' }}>
                    <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--muted-plum)' }}>
                      {TYPE_LABELS[a.question.type] ?? a.question.type}
                    </div>
                    <div style={{ fontWeight: 800, color: 'var(--dark-ink)', marginTop: 4 }}>{a.question.prompt}</div>
                    <div style={{ fontSize: '0.85rem', marginTop: 6 }}>
                      <span style={{ color: '#be123c' }}>You chose: {a.question.options[a.picked]}</span>
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#059669' }}>
                      Answer: {a.question.options[a.question.correct]}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--muted-plum)', marginTop: 6 }}>{a.question.explanation}</div>
                  </div>
                ))}
              </div>
            </>
          )}

          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 22, flexWrap: 'wrap' }}>
            <button className="primary-btn" onClick={loadDrill}>New drill</button>
            <Link to="/grammar" className="secondary-btn">Browse Grammar</Link>
            <Link to="/practice" className="ghost-btn">Back to Practice</Link>
          </div>
        </motion.div>
      </div>
    )
  }

  const answered = picked !== null
  const isRight = answered && picked === question.correct

  return (
    <div className="page-shell">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <p className="eyebrow">Practice Hub</p>
          <h1 className="page-title" style={{ marginTop: 4, fontSize: '1.6rem' }}>Grammar Drills</h1>
        </div>
        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--muted-plum)' }}>
          {index + 1} / {questions.length} · {score} correct
        </span>
      </div>

      {renderControls()}

      <div className="progress-bar-wrap">
        <motion.div className="progress-bar-fill" animate={{ width: `${(index / questions.length) * 100}%` }} transition={{ duration: 0.4 }} />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={question.id}
          className="clay-card clay-card--lg"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <span className={`badge badge-${(question.level || 'n5').toLowerCase()}`}>{question.level}</span>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--muted-plum)' }}>
              {question.instruction}
            </span>
          </div>

          <div style={{
            fontSize: question.type === 'pattern' ? '1.1rem' : '1.35rem',
            fontWeight: 800, color: 'var(--dark-ink)', marginTop: 14, lineHeight: 1.6,
          }}>
            {question.prompt}
          </div>

          <div style={{ display: 'grid', gap: 10, marginTop: 20 }}>
            {question.options.map((option, i) => {
              const isAnswer = i === question.correct
              const isPicked = i === picked
              let background = 'rgba(255,255,255,0.7)'
              let border = '1px solid rgba(201,122,74,0.18)'
              let color = 'var(--dark-ink)'
              if (answered && isAnswer) {
                background = 'rgba(52,211,153,0.16)'; border = '1px solid #059669'; color = '#065f46'
              } else if (answered && isPicked) {
                background = 'rgba(244,63,94,0.12)'; border = '1px solid #be123c'; color = '#9f1239'
              }
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => choose(i)}
                  disabled={answered}
                  style={{
                    textAlign: 'left', padding: '12px 16px', borderRadius: 14,
                    background, border, color,
                    fontSize: '0.95rem', fontWeight: 700, lineHeight: 1.5,
                    cursor: answered ? 'default' : 'pointer',
                    transition: 'all 160ms',
                  }}
                >
                  <span style={{ color: 'var(--muted-plum)', marginRight: 8, fontWeight: 800 }}>
                    {String.fromCharCode(65 + i)}
                  </span>
                  {option}
                  {answered && isAnswer && <span style={{ float: 'right' }}>✓</span>}
                  {answered && isPicked && !isAnswer && <span style={{ float: 'right' }}>✕</span>}
                </button>
              )
            })}
          </div>

          <AnimatePresence>
            {answered && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} style={{ overflow: 'hidden' }}>
                <div className={isRight ? 'notice notice-green' : 'notice notice-gold'} style={{ marginTop: 18 }}>
                  <strong>{isRight ? 'Correct.' : 'Not quite.'}</strong> {question.explanation}
                </div>

                {question.sentence && (
                  <div style={{ marginTop: 12, padding: '12px 14px', borderRadius: 12, background: 'rgba(201,122,74,0.06)', border: '1px solid rgba(201,122,74,0.12)' }}>
                    <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--dark-ink)' }}>
                      {question.type === 'cloze'
                        ? question.sentence.replace('＿＿＿', question.options[question.correct])
                        : question.sentence}
                    </div>
                    {question.translation && (
                      <div style={{ fontSize: '0.85rem', color: 'var(--muted-plum)', marginTop: 4 }}>{question.translation}</div>
                    )}
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
                  <button className="primary-btn" onClick={next}>
                    {index + 1 >= questions.length ? 'See results →' : 'Next question →'}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
