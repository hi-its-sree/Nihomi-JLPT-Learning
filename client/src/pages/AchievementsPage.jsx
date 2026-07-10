import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import api from '../lib/api'

const RARITY_COLORS = {
  Common:    { color: '#6b7280', bg: 'rgba(107,114,128,0.10)' },
  Uncommon:  { color: '#0284c7', bg: 'rgba(2,132,199,0.10)'   },
  Rare:      { color: '#7c3aed', bg: 'rgba(124,58,237,0.10)'  },
  Epic:      { color: '#b45309', bg: 'rgba(180,83,9,0.10)'    },
  Legendary: { color: '#be123c', bg: 'rgba(190,18,60,0.10)'   },
}

export default function AchievementsPage() {
  const [achievements, setAchievements] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let isActive = true

    const loadAchievements = async () => {
      try {
        setLoading(true)
        const { data } = await api.get('/api/v1/achievements')
        if (!isActive) return
        setAchievements(data.achievements ?? [])
        setError('')
      } catch {
        if (isActive) {
          setError('Unable to load your live achievements right now.')
        }
      } finally {
        if (isActive) {
          setLoading(false)
        }
      }
    }

    loadAchievements()
    const intervalId = window.setInterval(loadAchievements, 30000)

    return () => {
      isActive = false
      window.clearInterval(intervalId)
    }
  }, [])

  const earned = achievements.filter(a => a.earned)
  const pending = achievements.filter(a => !a.earned)
  const totalXP = earned.reduce((sum, a) => sum + (a.xp ?? 0), 0)

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
            <div style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--dark-ink)' }}>{achievements.length}</div>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--muted-plum)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Total</div>
          </div>
          <div>
            <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#c9a84c' }}>{totalXP.toLocaleString()}</div>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--muted-plum)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>XP from badges</div>
          </div>
        </div>
        <span style={{ position: 'absolute', right: 24, top: '50%', transform: 'translateY(-50%)', fontSize: '7rem', fontWeight: 900, color: 'rgba(201,168,76,0.06)', pointerEvents: 'none' }}>🏆</span>
      </motion.div>

      {error && (
        <div className="clay-card" style={{ marginBottom: 14, padding: '10px 14px', color: 'var(--muted-plum)' }}>
          {error}
        </div>
      )}

      {loading && achievements.length === 0 && (
        <div className="clay-card" style={{ marginBottom: 14, padding: '14px', color: 'var(--muted-plum)' }}>
          Syncing your achievement progress…
        </div>
      )}

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
                <div className="achievement-name">{a.title}</div>
                <div className="achievement-desc">{a.desc}</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'center', marginTop: 4 }}>
                  <span style={{ fontSize: '0.68rem', fontWeight: 700, padding: '2px 8px', borderRadius: 999, background: rarity.bg, color: rarity.color }}>{a.rarity}</span>
                  <span style={{ fontSize: '0.7rem', color: '#c9a84c', fontWeight: 700 }}>+{a.xp} XP</span>
                  {a.date && <span style={{ fontSize: '0.65rem', color: 'var(--muted-plum)' }}>{new Date(a.date).toLocaleDateString()}</span>}
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
                <div className="achievement-name">{a.title}</div>
                <div className="achievement-desc">{a.desc}</div>
                <span style={{ fontSize: '0.68rem', fontWeight: 700, padding: '2px 8px', borderRadius: 999, background: rarity.bg, color: rarity.color, marginTop: 4 }}>{a.rarity}</span>
                {a.goal > 0 && (
                  <div style={{ width: '100%', marginTop: 8 }}>
                    <div className="progress-bar-wrap">
                      <div className="progress-bar-fill" style={{ width: `${Math.min(100, a.progress ?? 0)}%` }} />
                    </div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--muted-plum)', marginTop: 4, textAlign: 'center' }}>
                      {a.current ?? 0} / {a.goal ?? 0}
                    </div>
                  </div>
                )}
              </motion.div>
            )
          })}
        </div>
      </div>

    </div>
  )
}
