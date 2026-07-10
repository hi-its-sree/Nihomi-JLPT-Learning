import { AnimatePresence, motion } from 'framer-motion'

export default function XPToast({ xp, visible }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div className="xp-toast"
          initial={{ opacity: 0, y: -12, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -12, scale: 0.9 }}
          transition={{ type: 'spring', stiffness: 300, damping: 22 }}
        >
          +{xp} XP
        </motion.div>
      )}
    </AnimatePresence>
  )
}
