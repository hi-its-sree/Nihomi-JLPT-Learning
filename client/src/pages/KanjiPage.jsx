import { useState } from 'react'
import { motion } from 'framer-motion'
import { Link, useParams } from 'react-router-dom'

const ALL_KANJI = [
  { char: '日', meaning: 'sun / day',    reading: 'にち・じつ / ひ', level: 'N5', strokes: 4,  on: 'ニチ・ジツ',   kun: 'ひ・か' },
  { char: '本', meaning: 'origin / book',reading: 'ほん / もと',     level: 'N5', strokes: 5,  on: 'ホン',        kun: 'もと' },
  { char: '人', meaning: 'person',       reading: 'じん / ひと',     level: 'N5', strokes: 2,  on: 'ジン・ニン',  kun: 'ひと' },
  { char: '水', meaning: 'water',        reading: 'すい / みず',     level: 'N5', strokes: 4,  on: 'スイ',        kun: 'みず' },
  { char: '山', meaning: 'mountain',     reading: 'さん / やま',     level: 'N5', strokes: 3,  on: 'サン',        kun: 'やま' },
  { char: '火', meaning: 'fire',         reading: 'か / ひ',         level: 'N5', strokes: 4,  on: 'カ',          kun: 'ひ・ほ' },
  { char: '木', meaning: 'tree',         reading: 'もく / き',       level: 'N5', strokes: 4,  on: 'モク・ボク',  kun: 'き・こ' },
  { char: '金', meaning: 'gold / money', reading: 'きん / かね',     level: 'N5', strokes: 8,  on: 'キン・コン',  kun: 'かね・かな' },
  { char: '土', meaning: 'earth / soil', reading: 'ど / つち',       level: 'N5', strokes: 3,  on: 'ド・ト',      kun: 'つち' },
  { char: '学', meaning: 'study',        reading: 'がく / まな',     level: 'N5', strokes: 8,  on: 'ガク',        kun: 'まな' },
  { char: '語', meaning: 'language',     reading: 'ご / かた',       level: 'N5', strokes: 14, on: 'ゴ',          kun: 'かた' },
  { char: '書', meaning: 'write',        reading: 'しょ / か',       level: 'N5', strokes: 10, on: 'ショ',        kun: 'か' },
  { char: '読', meaning: 'read',         reading: 'どく / よ',       level: 'N4', strokes: 14, on: 'ドク・トク',  kun: 'よ' },
  { char: '食', meaning: 'eat / food',   reading: 'しょく / た',     level: 'N4', strokes: 9,  on: 'ショク・ジキ',kun: 'た・く' },
  { char: '飲', meaning: 'drink',        reading: 'いん / の',       level: 'N4', strokes: 12, on: 'イン',        kun: 'の' },
  { char: '見', meaning: 'see / show',   reading: 'けん / み',       level: 'N5', strokes: 7,  on: 'ケン',        kun: 'み' },
  { char: '来', meaning: 'come',         reading: 'らい / く',       level: 'N5', strokes: 7,  on: 'ライ',        kun: 'く・き・こ' },
  { char: '行', meaning: 'go',           reading: 'こう / い',       level: 'N5', strokes: 6,  on: 'コウ・ギョウ',kun: 'い・ゆ・おこな' },
  { char: '知', meaning: 'know',         reading: 'ち / し',         level: 'N4', strokes: 8,  on: 'チ',          kun: 'し' },
  { char: '思', meaning: 'think',        reading: 'し / おも',       level: 'N4', strokes: 9,  on: 'シ',          kun: 'おも' },
  { char: '言', meaning: 'say / word',   reading: 'げん / い',       level: 'N4', strokes: 7,  on: 'ゲン・ゴン',  kun: 'い・こと' },
  { char: '国', meaning: 'country',      reading: 'こく / くに',     level: 'N4', strokes: 8,  on: 'コク',        kun: 'くに' },
  { char: '友', meaning: 'friend',       reading: 'ゆう / とも',     level: 'N4', strokes: 4,  on: 'ユウ',        kun: 'とも' },
  { char: '家', meaning: 'house / home', reading: 'か / いえ',       level: 'N4', strokes: 10, on: 'カ・ケ',      kun: 'いえ・や' },
  { char: '仕', meaning: 'serve / work', reading: 'し / つか',       level: 'N4', strokes: 5,  on: 'シ',          kun: 'つか' },
  { char: '事', meaning: 'matter / thing',reading: 'じ / こと',      level: 'N4', strokes: 8,  on: 'ジ・ズ',      kun: 'こと' },
  { char: '心', meaning: 'heart / mind', reading: 'しん / こころ',   level: 'N3', strokes: 4,  on: 'シン',        kun: 'こころ' },
  { char: '力', meaning: 'power',        reading: 'りょく / ちから', level: 'N3', strokes: 2,  on: 'リョク・リキ', kun: 'ちから' },
  { char: '問', meaning: 'question',     reading: 'もん / と',       level: 'N3', strokes: 11, on: 'モン',        kun: 'と・とん' },
  { char: '答', meaning: 'answer',       reading: 'とう / こた',     level: 'N3', strokes: 12, on: 'トウ',        kun: 'こた' },
  { char: '意', meaning: 'intention',    reading: 'い',              level: 'N3', strokes: 13, on: 'イ',          kun: '' },
  { char: '味', meaning: 'flavor / taste',reading: 'み / あじ',      level: 'N3', strokes: 8,  on: 'ミ',          kun: 'あじ' },
  { char: '変', meaning: 'change',       reading: 'へん / か',       level: 'N2', strokes: 9,  on: 'ヘン',        kun: 'か' },
  { char: '象', meaning: 'phenomenon',   reading: 'しょう / ぞう',   level: 'N2', strokes: 12, on: 'ショウ・ゾウ', kun: '' },
  { char: '論', meaning: 'argument',     reading: 'ろん',            level: 'N2', strokes: 15, on: 'ロン',        kun: '' },
  { char: '存', meaning: 'exist',        reading: 'そん / ぞん',     level: 'N2', strokes: 6,  on: 'ソン・ゾン',  kun: '' },
  { char: '概', meaning: 'outline',      reading: 'がい',            level: 'N1', strokes: 14, on: 'ガイ',        kun: '' },
  { char: '潜', meaning: 'submerge',     reading: 'せん / もぐ',     level: 'N1', strokes: 15, on: 'セン',        kun: 'もぐ' },
  { char: '醸', meaning: 'brew / foster',reading: 'じょう / かも',   level: 'N1', strokes: 20, on: 'ジョウ',      kun: 'かも' },
  { char: '覇', meaning: 'hegemony',     reading: 'は',              level: 'N1', strokes: 21, on: 'ハ',          kun: '' },
]

const LEVELS = ['All', 'N5', 'N4', 'N3', 'N2', 'N1']
const LEVEL_RE = /^N[1-5]$/i

const LEVEL_META = {
  N5: { title: 'N5 Beginner Kanji',           color: '#059669', total: 103 },
  N4: { title: 'N4 Elementary Kanji',         color: '#0284c7', total: 181 },
  N3: { title: 'N3 Intermediate Kanji',       color: '#7c3aed', total: 367 },
  N2: { title: 'N2 Upper-Intermediate Kanji', color: '#b45309', total: 367 },
  N1: { title: 'N1 Advanced Kanji',           color: '#be123c', total: 1118 },
}

export default function KanjiPage() {
  const { levelOrId } = useParams()

  // Level-specific mode when URL is /kanji/N5, /kanji/N4, etc.
  const levelParam = levelOrId && LEVEL_RE.test(levelOrId) ? levelOrId.toUpperCase() : null

  const [activeLevel, setActiveLevel] = useState(levelParam ?? 'All')
  const [search, setSearch] = useState('')

  const effectiveLevel = levelParam ?? activeLevel
  const meta = levelParam ? LEVEL_META[levelParam] : null

  const filtered = ALL_KANJI.filter(k => {
    const matchLevel = effectiveLevel === 'All' || k.level === effectiveLevel
    const q = search.toLowerCase()
    const matchSearch = !q || k.char.includes(q) || k.meaning.toLowerCase().includes(q) || k.reading.includes(q)
    return matchLevel && matchSearch
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
          <Link to="/kanji" className="ghost-btn btn-sm" style={{ marginBottom: 12, display: 'inline-flex' }}>
            ← All Kanji
          </Link>
        )}
        <p className="eyebrow">Kanji Library</p>
        <h1 className="page-title" style={{ marginTop: 8 }}>
          {meta ? meta.title : 'Explore Kanji'}
        </h1>
        <p className="page-subtitle" style={{ marginTop: 10 }}>
          {meta
            ? `${meta.total.toLocaleString()} kanji at ${levelParam} level. Tap any card to study stroke order and readings.`
            : 'Study stroke order, readings, and meanings. Tap any kanji to open its full detail page.'}
        </p>
        <div style={{ marginTop: 16, display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          <input
            className="field-input"
            placeholder="Search kanji, meaning, or reading…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ flex: '1 1 240px', maxWidth: 360 }}
          />
          <Link to="/flashcards" className="secondary-btn">SRS Review →</Link>
        </div>
      </motion.div>

      {/* Level filter pills — general mode only */}
      {!levelParam && (
        <motion.div
          className="filter-bar"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {LEVELS.map(l => (
            <button
              key={l}
              className={`filter-pill ${activeLevel === l ? 'active' : ''}`}
              onClick={() => setActiveLevel(l)}
            >
              {l}
            </button>
          ))}
          <span style={{ marginLeft: 'auto', fontSize: '0.82rem', color: 'var(--muted-plum)', fontWeight: 600 }}>
            {filtered.length} kanji
          </span>
        </motion.div>
      )}

      {/* Level badge — level-specific mode */}
      {levelParam && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          style={{ display: 'flex', alignItems: 'center', gap: 10 }}
        >
          <span
            className="filter-pill active"
            style={{ background: meta?.color, color: '#fff', border: 'none' }}
          >
            {levelParam}
          </span>
          <span style={{ fontSize: '0.82rem', color: 'var(--muted-plum)', fontWeight: 600 }}>
            {filtered.length} kanji shown
          </span>
        </motion.div>
      )}

      {/* Kanji grid */}
      <div className="kanji-grid">
        {filtered.map((k, i) => (
          <motion.div
            key={k.char}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.03, duration: 0.3 }}
          >
            <Link to={`/kanji-detail/${encodeURIComponent(k.char)}`} className="kanji-card">
              <div className="kanji-char">{k.char}</div>
              <div className="kanji-reading">{k.reading.split(' / ')[0]}</div>
              <div className="kanji-meaning">{k.meaning}</div>
              <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginTop: 4, flexWrap: 'wrap' }}>
                <span className={`badge badge-${k.level.toLowerCase()}`}>{k.level}</span>
                <span style={{ fontSize: '0.68rem', color: 'var(--muted-plum)', fontWeight: 600 }}>{k.strokes} strokes</span>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px 24px', color: 'var(--muted-plum)' }}>
          <div style={{ fontSize: '3rem', marginBottom: 12 }}>字</div>
          <p style={{ fontWeight: 600 }}>No kanji match your search. Try a different term.</p>
        </div>
      )}

    </div>
  )
}
