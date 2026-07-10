import { AnimatePresence, motion } from 'framer-motion'

// badge: { icon, name, desc, xp }
export default function AchievementUnlockModal({ open, badge, onClose }) {
  return (
    <AnimatePresence>
      {open && badge && (
        <motion.div className="unlock-overlay"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div className="unlock-card"
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            onClick={(e) => e.stopPropagation()}
          >
            <motion.div className="unlock-icon"
              animate={{ rotate: [0, -8, 8, -6, 0], scale: [1, 1.15, 1] }}
              transition={{ duration: 0.9, delay: 0.15 }}
            >
              {badge.icon}
            </motion.div>
            <p className="unlock-title">Achievement Unlocked</p>
            <h3 className="unlock-name">{badge.name}</h3>
            <p className="unlock-desc">{badge.desc}</p>
            {typeof badge.xp === 'number' && <p className="unlock-xp">+{badge.xp} XP</p>}
            <button type="button" className="primary-btn" style={{ marginTop: 22 }} onClick={onClose}>
              Continue →
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
