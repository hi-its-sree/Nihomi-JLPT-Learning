import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link, useSearchParams } from 'react-router-dom'

const LESSONS = {
  greetings: {
    id: 'greetings',
    title: 'Greetings & Self-Introduction',
    level: 'N5',
    xp: 80,
    sections: ['Vocabulary', 'Grammar', 'Listening', 'Review'],
    vocabulary: [
      { word: 'こんにちは', reading: 'Konnichiwa', meaning: 'Hello / Good afternoon', example: 'こんにちは、田中さん。', exTl: 'Hello, Tanaka-san.' },
      { word: 'おはようございます', reading: 'Ohayou gozaimasu', meaning: 'Good morning (formal)', example: 'おはようございます。', exTl: 'Good morning.' },
      { word: 'はじめまして', reading: 'Hajimemashite', meaning: 'Nice to meet you', example: 'はじめまして、山田です。', exTl: 'Nice to meet you, I\'m Yamada.' },
      { word: 'よろしくおねがいします', reading: 'Yoroshiku onegaishimasu', meaning: 'Please take care of me', example: 'どうぞよろしくおねがいします。', exTl: 'Please treat me well.' },
      { word: 'わたし', reading: 'Watashi', meaning: 'I / Me', example: 'わたしはスミスです。', exTl: 'I am Smith.' },
    ],
    grammar: [
      {
        pattern: '〜は〜です',
        meaning: 'Topic is [noun/adjective]',
        structure: '[Topic]は[Noun/Adj]です',
        examples: [
          { jp: 'わたしは学生です。', en: 'I am a student.' },
          { jp: 'これは本です。', en: 'This is a book.' },
          { jp: 'かれは先生です。', en: 'He is a teacher.' },
        ],
        note: 'は (wa) marks the topic of the sentence. です is a polite copula meaning "is/am/are".',
      },
      {
        pattern: 'わたしは〜じん/〜ご です',
        meaning: 'I am [nationality] / I speak [language]',
        structure: 'わたしは[country]じんです',
        examples: [
          { jp: 'わたしはイギリスじんです。', en: 'I am British.' },
          { jp: 'わたしのしゅみはにほんごです。', en: 'My hobby is Japanese.' },
        ],
        note: 'じん (jin) = person/nationality. Common for self-introduction.',
      },
    ],
    listening: {
      title: 'Dialogue: First Meeting',
      transcript: [
        { speaker: 'A', jp: 'はじめまして。わたしはエマです。', en: 'Nice to meet you. I am Emma.' },
        { speaker: 'B', jp: 'はじめまして。ぼくは田中 けんじです。', en: 'Nice to meet you. I am Kenji Tanaka.' },
        { speaker: 'A', jp: 'イギリスじんです。よろしくおねがいします。', en: 'I\'m British. Pleased to meet you.' },
        { speaker: 'B', jp: 'こちらこそ。いまどこにすんでいますか？', en: 'Likewise. Where do you live now?' },
        { speaker: 'A', jp: 'とうきょうにすんでいます。', en: 'I live in Tokyo.' },
      ],
      questions: [
        { q: 'What is the woman\'s name?', options: ['Emma', 'Kenji', 'Tanaka', 'Tokyo'], answer: 0 },
        { q: 'What nationality is she?', options: ['Japanese', 'American', 'British', 'French'], answer: 2 },
        { q: 'Where does she live?', options: ['Osaka', 'Kyoto', 'Nagoya', 'Tokyo'], answer: 3 },
      ],
    },
  },
}

const DEFAULT_LESSON = LESSONS.greetings

export default function LessonPage() {
  const [searchParams] = useSearchParams()
  const lessonKey = searchParams.get('id') || 'greetings'
  const lesson = LESSONS[lessonKey] || DEFAULT_LESSON

  const [section, setSection] = useState(0)
  const [vocabIdx, setVocabIdx] = useState(0)
  const [showExample, setShowExample] = useState(false)
  const [grammarIdx, setGrammarIdx] = useState(0)
  const [listenAnswers, setListenAnswers] = useState({})
  const [listenChecked, setListenChecked] = useState(false)
  const [done, setDone] = useState(false)

  const totalSections = lesson.sections.length
  const progress = (section / totalSections) * 100

  function nextSection() {
    if (section < totalSections - 1) {
      setSection(s => s + 1)
      setVocabIdx(0)
      setShowExample(false)
      setGrammarIdx(0)
    } else {
      setDone(true)
    }
  }

  if (done) {
    return (
      <div className="page-shell">
        <motion.div
          className="clay-card clay-card--lg"
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          style={{ textAlign: 'center' }}
        >
          <motion.div
            animate={{ rotate: [0, 10, -10, 10, 0] }}
            transition={{ delay: 0.3, duration: 0.6 }}
            style={{ fontSize: '4rem', marginBottom: 16 }}
          >
            🎌
          </motion.div>
          <h1 className="page-title">Lesson Complete!</h1>
          <p className="page-subtitle" style={{ marginTop: 8 }}>
            You finished <strong>{lesson.title}</strong> and earned{' '}
            <strong style={{ color: 'var(--terracotta)' }}>{lesson.xp} XP</strong>.
          </p>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 24, flexWrap: 'wrap' }}>
            <Link to="/flashcards" className="primary-btn">Review with Flashcards →</Link>
            <Link to="/levels" className="secondary-btn">Back to Levels</Link>
            <Link to="/dashboard" className="ghost-btn">Dashboard</Link>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="page-shell">

      {/* Header */}
      <motion.div
        className="clay-card clay-card--lg"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ position: 'relative', overflow: 'hidden' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12, flexWrap: 'wrap' }}>
          <span className="badge badge-n5">{lesson.level}</span>
          <span className="eyebrow" style={{ marginBottom: 0 }}>Lesson</span>
          <span style={{ marginLeft: 'auto', fontSize: '0.8rem', color: 'var(--muted-plum)', fontWeight: 700 }}>
            +{lesson.xp} XP
          </span>
        </div>
        <h1 className="page-title" style={{ fontSize: '1.5rem', marginTop: 4 }}>{lesson.title}</h1>

        {/* Section progress */}
        <div style={{ marginTop: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            {lesson.sections.map((s, i) => (
              <span
                key={s}
                style={{
                  fontSize: '0.75rem', fontWeight: 700,
                  color: i === section ? 'var(--terracotta)' : i < section ? 'var(--muted-plum)' : 'rgba(0,0,0,0.25)',
                  transition: 'color 300ms',
                }}
              >
                {i < section ? '✓ ' : ''}{s}
              </span>
            ))}
          </div>
          <div className="progress-bar-wrap">
            <motion.div
              className="progress-bar-fill"
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>
        <span style={{ position: 'absolute', right: 20, top: '50%', transform: 'translateY(-50%)', fontSize: '5rem', fontWeight: 900, color: 'rgba(201,122,74,0.05)', pointerEvents: 'none' }}>
          {lesson.sections[section][0]}
        </span>
      </motion.div>

      {/* Section content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={section}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.25 }}
        >

          {/* Vocabulary */}
          {section === 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="section-title">Vocabulary</span>
                <span style={{ fontSize: '0.8rem', color: 'var(--muted-plum)', fontWeight: 700 }}>
                  {vocabIdx + 1} / {lesson.vocabulary.length}
                </span>
              </div>

              <motion.div
                key={vocabIdx}
                className="clay-card"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                style={{ textAlign: 'center', padding: '32px 24px' }}
              >
                <div style={{ fontSize: '2.8rem', fontWeight: 900, color: 'var(--dark-ink)', marginBottom: 8, fontFamily: '"Noto Sans JP", sans-serif' }}>
                  {lesson.vocabulary[vocabIdx].word}
                </div>
                <div style={{ fontSize: '1rem', color: 'var(--terracotta)', fontWeight: 700, marginBottom: 4 }}>
                  {lesson.vocabulary[vocabIdx].reading}
                </div>
                <div style={{ fontSize: '1rem', color: 'var(--muted-plum)', fontWeight: 600 }}>
                  {lesson.vocabulary[vocabIdx].meaning}
                </div>

                <AnimatePresence>
                  {showExample && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      style={{ marginTop: 20, padding: '14px 18px', background: 'rgba(201,122,74,0.06)', borderRadius: 14, textAlign: 'left', overflow: 'hidden' }}
                    >
                      <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--dark-ink)', fontFamily: '"Noto Sans JP", sans-serif' }}>
                        {lesson.vocabulary[vocabIdx].example}
                      </div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--muted-plum)', marginTop: 4 }}>
                        {lesson.vocabulary[vocabIdx].exTl}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 20, flexWrap: 'wrap' }}>
                  <button className="ghost-btn" onClick={() => setShowExample(v => !v)}>
                    {showExample ? 'Hide example' : 'Show example'}
                  </button>
                  {vocabIdx < lesson.vocabulary.length - 1 ? (
                    <button className="primary-btn" onClick={() => { setVocabIdx(i => i + 1); setShowExample(false) }}>
                      Next word →
                    </button>
                  ) : (
                    <button className="primary-btn" onClick={nextSection}>
                      Continue to Grammar →
                    </button>
                  )}
                </div>
              </motion.div>

              <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
                {lesson.vocabulary.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => { setVocabIdx(i); setShowExample(false) }}
                    style={{
                      width: i === vocabIdx ? 24 : 8, height: 8, borderRadius: 999, border: 'none', cursor: 'pointer',
                      background: i === vocabIdx ? 'var(--terracotta)' : i < vocabIdx ? 'rgba(201,122,74,0.4)' : 'rgba(201,122,74,0.15)',
                      transition: 'all 300ms',
                    }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Grammar */}
          {section === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
                <span className="section-title">Grammar</span>
                <div style={{ display: 'flex', gap: 8 }}>
                  {lesson.grammar.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setGrammarIdx(i)}
                      className={`filter-pill ${i === grammarIdx ? 'active' : ''}`}
                    >
                      Pattern {i + 1}
                    </button>
                  ))}
                </div>
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={grammarIdx}
                  className="clay-card"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <div style={{ background: 'rgba(201,122,74,0.08)', borderRadius: 14, padding: '16px 20px', marginBottom: 16 }}>
                    <div style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--dark-ink)', fontFamily: '"Noto Sans JP", sans-serif' }}>
                      {lesson.grammar[grammarIdx].pattern}
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--terracotta)', fontWeight: 700, marginTop: 4 }}>
                      {lesson.grammar[grammarIdx].meaning}
                    </div>
                  </div>

                  <div style={{ fontSize: '0.82rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--muted-plum)', marginBottom: 8 }}>
                    Structure
                  </div>
                  <div style={{ display: 'block', padding: '10px 14px', background: 'rgba(0,0,0,0.04)', borderRadius: 10, fontSize: '0.9rem', color: 'var(--dark-ink)', fontFamily: 'monospace', marginBottom: 16 }}>
                    {lesson.grammar[grammarIdx].structure}
                  </div>

                  <div style={{ fontSize: '0.82rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--muted-plum)', marginBottom: 10 }}>
                    Examples
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {lesson.grammar[grammarIdx].examples.map((ex, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.08 }}
                        style={{ padding: '10px 14px', background: 'rgba(255,255,255,0.7)', borderRadius: 12, border: '1px solid rgba(201,122,74,0.1)' }}
                      >
                        <div style={{ fontWeight: 700, color: 'var(--dark-ink)', fontFamily: '"Noto Sans JP", sans-serif' }}>{ex.jp}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--muted-plum)', marginTop: 2 }}>{ex.en}</div>
                      </motion.div>
                    ))}
                  </div>

                  {lesson.grammar[grammarIdx].note && (
                    <div className="notice notice-gold" style={{ marginTop: 16 }}>
                      {lesson.grammar[grammarIdx].note}
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>

              {grammarIdx < lesson.grammar.length - 1 ? (
                <button className="primary-btn" style={{ alignSelf: 'flex-end' }} onClick={() => setGrammarIdx(i => i + 1)}>
                  Next pattern →
                </button>
              ) : (
                <button className="primary-btn" style={{ alignSelf: 'flex-end' }} onClick={nextSection}>
                  Continue to Listening →
                </button>
              )}
            </div>
          )}

          {/* Listening */}
          {section === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <span className="section-title">Listening</span>

              <motion.div className="clay-card" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--dark-ink)', marginBottom: 14 }}>
                  {lesson.listening.title}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {lesson.listening.transcript.map((line, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: line.speaker === 'A' ? -10 : 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      style={{
                        display: 'flex', gap: 12, alignItems: 'flex-start',
                        flexDirection: line.speaker === 'B' ? 'row-reverse' : 'row',
                      }}
                    >
                      <div style={{
                        width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                        background: line.speaker === 'A' ? 'rgba(201,122,74,0.15)' : 'rgba(100,80,140,0.12)',
                        display: 'grid', placeItems: 'center', fontWeight: 900, fontSize: '0.8rem',
                        color: line.speaker === 'A' ? 'var(--terracotta)' : 'var(--muted-plum)',
                      }}>
                        {line.speaker}
                      </div>
                      <div style={{
                        flex: 1, padding: '10px 14px', borderRadius: 14,
                        background: line.speaker === 'A' ? 'rgba(201,122,74,0.06)' : 'rgba(255,255,255,0.7)',
                        border: '1px solid rgba(201,122,74,0.08)',
                        textAlign: line.speaker === 'B' ? 'right' : 'left',
                      }}>
                        <div style={{ fontWeight: 700, color: 'var(--dark-ink)', fontSize: '0.95rem', fontFamily: '"Noto Sans JP", sans-serif' }}>
                          {line.jp}
                        </div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--muted-plum)', marginTop: 3 }}>{line.en}</div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              <motion.div className="clay-card" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                <div style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--dark-ink)', marginBottom: 14 }}>
                  Comprehension Questions
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {lesson.listening.questions.map((q, qi) => (
                    <div key={qi}>
                      <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--dark-ink)', marginBottom: 8 }}>
                        {qi + 1}. {q.q}
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                        {q.options.map((opt, oi) => {
                          const selected = listenAnswers[qi] === oi
                          const correct = listenChecked && oi === q.answer
                          const wrong = listenChecked && selected && oi !== q.answer
                          return (
                            <button
                              key={oi}
                              className={`test-option${correct ? ' correct' : wrong ? ' incorrect' : selected ? ' selected' : ''}`}
                              onClick={() => !listenChecked && setListenAnswers(a => ({ ...a, [qi]: oi }))}
                              style={{ textAlign: 'left' }}
                            >
                              <span style={{ fontWeight: 700, marginRight: 6, color: 'var(--terracotta)' }}>{String.fromCharCode(65 + oi)}.</span>
                              {opt}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ marginTop: 16, display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                  {!listenChecked ? (
                    <button
                      className="primary-btn"
                      disabled={Object.keys(listenAnswers).length < lesson.listening.questions.length}
                      onClick={() => setListenChecked(true)}
                    >
                      Check answers
                    </button>
                  ) : (
                    <>
                      <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--terracotta)' }}>
                        ✓ {lesson.listening.questions.filter((q, i) => listenAnswers[i] === q.answer).length} / {lesson.listening.questions.length} correct
                      </div>
                      <button className="primary-btn" style={{ marginLeft: 'auto' }} onClick={nextSection}>
                        Continue to Review →
                      </button>
                    </>
                  )}
                </div>
              </motion.div>
            </div>
          )}

          {/* Review */}
          {section === 3 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <span className="section-title">Review</span>

              <motion.div className="clay-card clay-card--lg" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '3rem', marginBottom: 12 }}>📝</div>
                <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--dark-ink)' }}>Lesson Summary</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 12, marginTop: 20, textAlign: 'left' }}>
                  {[
                    { icon: '語', label: 'Vocabulary', val: `${lesson.vocabulary.length} words` },
                    { icon: '文', label: 'Grammar', val: `${lesson.grammar.length} patterns` },
                    { icon: '👂', label: 'Listening', val: '1 dialogue' },
                    { icon: '⭐', label: 'XP earned', val: `+${lesson.xp}` },
                  ].map(s => (
                    <div key={s.label} className="stat-card">
                      <div className="stat-card-icon">{s.icon}</div>
                      <div className="stat-card-value" style={{ fontSize: '1rem' }}>{s.val}</div>
                      <div className="stat-card-label">{s.label}</div>
                    </div>
                  ))}
                </div>
                <p style={{ fontSize: '0.88rem', color: 'var(--muted-plum)', marginTop: 16, marginBottom: 16 }}>
                  Great work! These words and patterns will appear in your SRS flashcard deck for review.
                </p>
                <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
                  <motion.button
                    className="primary-btn"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={nextSection}
                  >
                    Complete lesson →
                  </motion.button>
                  <Link to="/flashcards" className="secondary-btn">Review flashcards</Link>
                </div>
              </motion.div>

              <div className="grid-3">
                {lesson.vocabulary.map((v, i) => (
                  <motion.div
                    key={v.word}
                    className="content-card"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.06 }}
                    style={{ textAlign: 'center' }}
                  >
                    <div style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--dark-ink)', fontFamily: '"Noto Sans JP", sans-serif' }}>{v.word}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--terracotta)', fontWeight: 700, marginTop: 4 }}>{v.reading}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--muted-plum)', marginTop: 2 }}>{v.meaning}</div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

        </motion.div>
      </AnimatePresence>

    </div>
  )
}
