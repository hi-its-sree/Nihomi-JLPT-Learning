import { useState } from 'react'
import { motion } from 'framer-motion'
import { Link, useParams } from 'react-router-dom'

const VOCABULARY = [
  { word: 'こんにちは', kana: 'こんにちは', meaning: 'Hello / Good afternoon', level: 'N5', pos: 'phrase',    srsStage: 'new',     example: 'こんにちは！元気ですか？' },
  { word: '学校',      kana: 'がっこう',   meaning: 'School',                  level: 'N5', pos: 'noun',     srsStage: 'known',   example: '学校は楽しいです。' },
  { word: '勉強する',   kana: 'べんきょうする', meaning: 'To study',             level: 'N5', pos: 'verb',     srsStage: 'review',  example: '毎日日本語を勉強します。' },
  { word: '電車',      kana: 'でんしゃ',   meaning: 'Train',                   level: 'N5', pos: 'noun',     srsStage: 'known',   example: '電車で学校へ行きます。' },
  { word: '自然',      kana: 'しぜん',     meaning: 'Nature',                  level: 'N3', pos: 'noun',     srsStage: 'new',     example: '自然が大好きです。' },
  { word: '経験',      kana: 'けいけん',   meaning: 'Experience',              level: 'N3', pos: 'noun',     srsStage: 'new',     example: '大切な経験です。' },
  { word: '達成する',   kana: 'たっせいする', meaning: 'To achieve / accomplish', level: 'N2', pos: 'verb',  srsStage: 'new',     example: '目標を達成した。' },
  { word: '複雑',      kana: 'ふくざつ',   meaning: 'Complex / complicated',   level: 'N2', pos: 'adj',      srsStage: 'new',     example: '複雑な問題だ。' },
  { word: '曖昧',      kana: 'あいまい',   meaning: 'Vague / ambiguous',       level: 'N1', pos: 'adj',      srsStage: 'new',     example: '曖昧な表現を避けてください。' },
  { word: '概念',      kana: 'がいねん',   meaning: 'Concept / notion',        level: 'N1', pos: 'noun',     srsStage: 'new',     example: '重要な概念を理解した。' },
  { word: '友達',      kana: 'ともだち',   meaning: 'Friend',                  level: 'N5', pos: 'noun',     srsStage: 'known',   example: '友達と公園へ行きました。' },
  { word: '仕事',      kana: 'しごと',     meaning: 'Work / job',              level: 'N4', pos: 'noun',     srsStage: 'review',  example: '仕事が好きです。' },
]

const STAGES = {
  new:    { label: 'New',    color: '#0284c7', bg: 'rgba(56,189,248,0.12)'  },
  review: { label: 'Review', color: '#b45309', bg: 'rgba(251,191,36,0.12)' },
  known:  { label: 'Known',  color: '#059669', bg: 'rgba(52,211,153,0.12)' },
}

const LEVELS = ['All', 'N5', 'N4', 'N3', 'N2', 'N1']
const POS_COLORS = { noun: '#7c3aed', verb: '#0284c7', adj: '#b45309', phrase: '#059669' }
const LEVEL_RE = /^N[1-5]$/i
const LEVEL_COLORS = { N5: '#059669', N4: '#0284c7', N3: '#7c3aed', N2: '#b45309', N1: '#be123c' }

export default function VocabularyPage() {
  const { levelOrId } = useParams()
  const levelParam = levelOrId && LEVEL_RE.test(levelOrId) ? levelOrId.toUpperCase() : null

  const [activeLevel, setActiveLevel] = useState(levelParam ?? 'All')
  const [search, setSearch]           = useState('')
  const [activeStage, setActiveStage] = useState('All')

  const effectiveLevel = levelParam ?? activeLevel

  const filtered = VOCABULARY.filter(v => {
    const matchLevel = effectiveLevel === 'All' || v.level === effectiveLevel
    const matchStage = activeStage === 'All' || v.srsStage === activeStage
    const q = search.toLowerCase()
    const matchSearch = !q || v.word.includes(q) || v.kana.includes(q) || v.meaning.toLowerCase().includes(q)
    return matchLevel && matchStage && matchSearch
  })

  return (
    <div className="page-shell">

      {/* Header */}
      <motion.div
        className="clay-card"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {levelParam && (
          <Link to="/vocabulary" className="ghost-btn btn-sm" style={{ marginBottom: 12, display: 'inline-flex' }}>
            ← All Vocabulary
          </Link>
        )}
        <p className="eyebrow">Vocabulary Library</p>
        <h1 className="page-title" style={{ marginTop: 8 }}>
          {levelParam ? `${levelParam} Vocabulary` : 'Build Your Word Bank'}
        </h1>
        <p className="page-subtitle" style={{ marginTop: 10 }}>
          {levelParam
            ? `All ${levelParam} words with pronunciation, meaning, and example usage. Study at your level.`
            : 'Every word with pronunciation, meaning, example usage, and SRS scheduling. Study words in context, not isolation.'}
        </p>
        <div style={{ marginTop: 16, display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          <input
            className="field-input"
            placeholder="Search words, meanings, or readings…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ flex: '1 1 240px', maxWidth: 360 }}
          />
          <Link to="/flashcards" className="primary-btn">SRS Review →</Link>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div
        style={{ display: 'flex', flexDirection: 'column', gap: 10 }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15 }}
      >
        {!levelParam && (
          <div className="filter-bar">
            {LEVELS.map(l => (
              <button key={l} className={`filter-pill ${activeLevel === l ? 'active' : ''}`} onClick={() => setActiveLevel(l)}>{l}</button>
            ))}
          </div>
        )}
        <div className="filter-bar">
          {levelParam && (
            <span
              className="filter-pill active"
              style={{ background: LEVEL_COLORS[levelParam], color: '#fff', border: 'none' }}
            >
              {levelParam}
            </span>
          )}
          {['All', 'new', 'review', 'known'].map(s => (
            <button key={s} className={`filter-pill ${activeStage === s ? 'active' : ''}`} onClick={() => setActiveStage(s)}>
              {s === 'All' ? 'All status' : STAGES[s]?.label}
            </button>
          ))}
          <span style={{ marginLeft: 'auto', fontSize: '0.82rem', color: 'var(--muted-plum)', fontWeight: 600 }}>
            {filtered.length} words
          </span>
        </div>
      </motion.div>

      {/* Word grid */}
      <div className="grid-2">
        {filtered.map((v, i) => {
          const stage = STAGES[v.srsStage]
          const posColor = POS_COLORS[v.pos] ?? 'var(--muted-plum)'
          return (
            <motion.div
              key={v.word}
              className="content-card"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
                <div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--dark-ink)', lineHeight: 1.2 }}>{v.word}</div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--terracotta)', fontWeight: 700, marginTop: 2 }}>{v.kana}</div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'flex-end' }}>
                  <span className={`badge badge-${v.level.toLowerCase()}`}>{v.level}</span>
                  <span style={{ fontSize: '0.68rem', fontWeight: 700, padding: '2px 8px', borderRadius: 999, background: `${posColor}18`, color: posColor }}>{v.pos}</span>
                </div>
              </div>

              <p style={{ color: 'var(--dark-ink)', fontWeight: 700, fontSize: '0.95rem', marginTop: 10 }}>{v.meaning}</p>

              <div style={{ marginTop: 10, padding: '10px 12px', borderRadius: 12, background: 'rgba(201,122,74,0.06)', border: '1px solid rgba(201,122,74,0.12)' }}>
                <span style={{ fontSize: '0.82rem', color: 'var(--muted-plum)' }}>{v.example}</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 12 }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, padding: '3px 10px', borderRadius: 999, background: stage.bg, color: stage.color }}>
                  {stage.label}
                </span>
                <button className="ghost-btn btn-sm" style={{ fontSize: '0.75rem' }}>Add to review</button>
              </div>
            </motion.div>
          )
        })}
      </div>

    </div>
  )
}
