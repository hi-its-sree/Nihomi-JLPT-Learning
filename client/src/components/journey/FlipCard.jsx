import { motion } from 'framer-motion'

// Tap-to-reveal / flip primitive shared by Writing Systems and Culture chapters.
// front/back: React nodes. flipped/onFlip: controlled state from the parent.
export default function FlipCard({ front, back, flipped, onFlip, height = 220 }) {
  return (
    <motion.div
      className="flashcard-scene"
      style={{ height, width: '100%' }}
      onClick={onFlip}
      whileHover={{ scale: 1.015 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className={`flashcard-inner ${flipped ? 'flipped' : ''}`}>
        <div className="flashcard-face flashcard-front">{front}</div>
        <div className="flashcard-face flashcard-back">{back}</div>
      </div>
    </motion.div>
  )
}
