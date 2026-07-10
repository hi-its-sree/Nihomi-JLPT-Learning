import { motion } from 'framer-motion'

// Hiragana/katakana/kanji drill card. state: 'idle' | 'correct' | 'incorrect'
export default function CharacterDrillCard({ character, romaji, meaning, strokeCount, state = 'idle', onClick, delay = 0 }) {
  return (
    <motion.div
      className={`drill-card ${state !== 'idle' ? state : ''}`}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.35 }}
      whileHover={onClick ? { y: -4 } : undefined}
      onClick={onClick}
    >
      <div className="drill-char">{character}</div>
      {romaji && <div className="drill-romaji">{romaji}</div>}
      {meaning && <div className="drill-meaning">{meaning}</div>}
      {typeof strokeCount === 'number' && (
        <div className="drill-meaning">{strokeCount} stroke{strokeCount === 1 ? '' : 's'}</div>
      )}
    </motion.div>
  )
}
