import { useState } from 'react'
import { motion } from 'framer-motion'
import ChapterHeader from '../../components/journey/ChapterHeader'
import AchievementUnlockModal from '../../components/journey/AchievementUnlockModal'
import XPToast from '../../components/journey/XPToast'
import { useChapterCompletion } from '../../components/journey/useChapterCompletion'
import { CHAPTERS } from './content/chapters'

const HABITS = [
  { icon: '📅', title: 'Consistency beats intensity', desc: '15 focused minutes daily beats a 3-hour cram once a week. Your brain needs repeated, spaced exposure.' },
  { icon: '🔁', title: 'Spaced repetition', desc: 'Review flashcards right before you\'d forget them — not too soon, not too late. This app\'s SRS system schedules that automatically.' },
  { icon: '📖', title: 'Read a little every day', desc: 'Even a few sentences of graded reading trains your eyes to recognize kanji and grammar in context.' },
  { icon: '👂', title: 'Listen daily', desc: 'Passive listening (podcasts, shows) trains your ear for rhythm and pitch, even before you understand every word.' },
  { icon: '✍️', title: 'Output, not just input', desc: 'Try writing a sentence or saying a phrase out loud. Producing Japanese cements what reading alone can\'t.' },
  { icon: '🎯', title: 'One weak point at a time', desc: 'Don\'t try to fix everything at once — target your single weakest area each week for the fastest visible progress.' },
]

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export default function StudyEffectivelyChapter() {
  const [selectedDays, setSelectedDays] = useState(['Mon', 'Wed', 'Fri', 'Sat'])
  const { finish, unlockedBadge, closeBadgeModal, showXpToast } = useChapterCompletion('study-effectively', '/journey/daily-conversation')

  function toggleDay(day) {
    setSelectedDays((prev) => (prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]))
  }

  return (
    <div className="journey-content-wrap">
      <ChapterHeader chapter={CHAPTERS['study-effectively']} />

      <div className="grid-3">
        {HABITS.map((h, i) => (
          <motion.div key={h.title} className="content-card" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
            <div style={{ fontSize: '1.8rem', marginBottom: 8 }}>{h.icon}</div>
            <h3>{h.title}</h3>
            <p>{h.desc}</p>
          </motion.div>
        ))}
      </div>

      <motion.div className="clay-card" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
        <h2 style={{ fontSize: '1.05rem', fontWeight: 900, color: 'var(--dark-ink)', marginBottom: 6 }}>Build your weekly plan</h2>
        <p style={{ color: 'var(--muted-plum)', fontSize: '0.85rem', marginBottom: 16 }}>
          Tap the days you realistically want to study. Aim for at least 4 — you can always adjust this later in Study Plan.
        </p>
        <div className="filter-bar">
          {DAYS.map((day) => (
            <button key={day} type="button" className={`filter-pill ${selectedDays.includes(day) ? 'active' : ''}`} onClick={() => toggleDay(day)}>
              {day}
            </button>
          ))}
        </div>
        <p style={{ marginTop: 14, fontSize: '0.82rem', color: 'var(--muted-plum)' }}>
          {selectedDays.length === 0
            ? 'Pick at least one day to continue.'
            : `${selectedDays.length} day${selectedDays.length === 1 ? '' : 's'} a week — that's a solid, sustainable rhythm.`}
        </p>
      </motion.div>

      <motion.div className="clay-card" style={{ textAlign: 'center' }} initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
        <h2 style={{ fontSize: '1.05rem', fontWeight: 900, color: 'var(--dark-ink)', marginBottom: 8 }}>Your daily mission</h2>
        <p style={{ color: 'var(--muted-plum)', fontSize: '0.85rem', marginBottom: 16 }}>
          Once you start N5: review your SRS queue, learn 1-2 new kanji, and read one short passage. That's it — that's the whole habit.
        </p>
        <button type="button" className="primary-btn" disabled={selectedDays.length === 0} onClick={finish}>Continue →</button>
      </motion.div>

      <XPToast xp={CHAPTERS['study-effectively'].xp} visible={showXpToast} />
      <AchievementUnlockModal open={!!unlockedBadge} badge={unlockedBadge} onClose={closeBadgeModal} />
    </div>
  )
}
