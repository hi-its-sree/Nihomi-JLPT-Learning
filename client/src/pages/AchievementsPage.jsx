import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

const ACHIEVEMENTS = [
  { id: 'a1', icon: '🌱', name: 'First Steps',        desc: 'Completed your first lesson',          earned: true,  date: '2026-05-15', xp: 50,  rarity: 'Common'  },
  { id: 'a2', icon: '🔥', name: '7-Day Streak',        desc: 'Studied 7 days in a row',              earned: true,  date: '2026-06-01', xp: 100, rarity: 'Uncommon' },
  { id: 'a3', icon: '🃏', name: 'Card Collector',      desc: 'Reviewed 100 flashcards',              earned: true,  date: '2026-06-10', xp: 75,  rarity: 'Common'   },
  { id: 'a4', icon: '📋', name: 'Test Taker',          desc: 'Completed first mock test',            earned: true,  date: '2026-06-22', xp: 150, rarity: 'Uncommon' },
  { id: 'a5', icon: '⛩',  name: 'N5 Master',           desc: 'Achieved 95%+ on N5 mock test',        earned: true,  date: '2026-05-30', xp: 300, rarity: 'Rare'    },
  { id: 'a6', icon: '字',  name: 'Kanji Explorer',      desc: 'Studied 100+ kanji characters',        earned: false, date: null,          xp: 200, rarity: 'Uncommon' },
  { id: 'a7', icon: '📖', name: 'Reading Champion',    desc: 'Scored 80%+ on 5 reading sections',    earned: false, date: null,          xp: 250, rarity: 'Rare'    },
  { id: 'a8', icon: '🎯', name: 'Exam Ready',          desc: 'Reached 80%+ JLPT readiness score',    earned: false, date: null,          xp: 500, rarity: 'Epic'    },
  { id: 'a9', icon: '🌸', name: 'Sakura Scholar',      desc: 'Studied 30 days in a row',             earned: false, date: null,          xp: 400, rarity: 'Rare'    },
  { id: 'a10',icon: '👑', name: 'N1 Champion',         desc: 'Achieved 90%+ on N1 mock test',        earned: false, date: null,          xp: 1000, rarity: 'Legendary' },
  { id: 'a11',icon: '⭐', name: 'XP Milestone',        desc: 'Earned 1000 XP total',                 earned: true,  date: '2026-06-20', xp: 100, rarity: 'Uncommon' },
  { id: 'a12',icon: '💬', name: 'Grammar Guru',        desc: 'Mastered 50+ grammar patterns',        earned: false, date: null,          xp: 300, rarity: 'Rare'    },
]

const RARITY_COLORS = {
  Common:    { color: '#6b7280', bg: 'rgba(107,114,128,0.10)' },
  Uncommon:  { color: '#0284c7', bg: 'rgba(2,132,199,0.10)'   },
  Rare:      { color: '#7c3aed', bg: 'rgba(124,58,237,0.10)'  },
  Epic:      { color: '#b45309', bg: 'rgba(180,83,9,0.10)'    },
  Legendary: { color: '#be123c', bg: 'rgba(190,18,60,0.10)'   },
}

export default function AchievementsPage() {
  const earned  = ACHIEVEMENTS.filter(a => a.earned)
  const pending = ACHIEVEMENTS.filter(a => !a.earned)
  const totalXP = earned.reduce((s, a) => s + a.xp, 0)

  return (
    <div className="page-shell">

      <motion.div className="clay-card clay-card--lg" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} style={{ position: 'relative', overflow: 'hidden' }}>
        <p className="eyebrow">Achievement Gallery</p>
        <h1 className="page-title" style={{ marginTop: 8 }}>Your Achievements</h1>
        <div style={{ display: 'flex', gap: 24, marginTop: 16, flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--dark-ink)' }}>{earned.length}</div>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--muted-plum)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Earned</div>
          </div>
          <div>
            <div style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--dark-ink)' }}>{ACHIEVEMENTS.length}</div>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--muted-plum)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Total</div>
          </div>
          <div>
            <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#c9a84c' }}>{totalXP.toLocaleString()}</div>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--muted-plum)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>XP from badges</div>
          </div>
        </div>
        <span style={{ position: 'absolute', right: 24, top: '50%', transform: 'translateY(-50%)', fontSize: '7rem', fontWeight: 900, color: 'rgba(201,168,76,0.06)', pointerEvents: 'none' }}>🏆</span>
      </motion.div>

      {/* Earned */}
      <div>
        <div className="section-header" style={{ marginBottom: 16 }}>
          <span className="section-title">Earned ({earned.length})</span>
        </div>
        <div className="achievement-grid">
          {earned.map((a, i) => {
            const rarity = RARITY_COLORS[a.rarity]
            return (
              <motion.div
                key={a.id}
                className="achievement-card"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                style={{ borderTop: `3px solid ${rarity.color}` }}
              >
                <div style={{ fontSize: '2.4rem' }}>{a.icon}</div>
                <div className="achievement-name">{a.name}</div>
                <div className="achievement-desc">{a.desc}</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'center', marginTop: 4 }}>
                  <span style={{ fontSize: '0.68rem', fontWeight: 700, padding: '2px 8px', borderRadius: 999, background: rarity.bg, color: rarity.color }}>{a.rarity}</span>
                  <span style={{ fontSize: '0.7rem', color: '#c9a84c', fontWeight: 700 }}>+{a.xp} XP</span>
                  {a.date && <span style={{ fontSize: '0.65rem', color: 'var(--muted-plum)' }}>{a.date}</span>}
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Locked */}
      <div>
        <div className="section-header" style={{ marginBottom: 16 }}>
          <span className="section-title">Locked ({pending.length})</span>
        </div>
        <div className="achievement-grid">
          {pending.map((a, i) => {
            const rarity = RARITY_COLORS[a.rarity]
            return (
              <motion.div
                key={a.id}
                className="achievement-card locked"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.04 }}
              >
                <div style={{ fontSize: '2.4rem', filter: 'grayscale(1)' }}>🔒</div>
                <div className="achievement-name">{a.name}</div>
                <div className="achievement-desc">{a.desc}</div>
                <span style={{ fontSize: '0.68rem', fontWeight: 700, padding: '2px 8px', borderRadius: 999, background: rarity.bg, color: rarity.color, marginTop: 4 }}>{a.rarity}</span>
              </motion.div>
            )
          })}
        </div>
      </div>

    </div>
  )
}
