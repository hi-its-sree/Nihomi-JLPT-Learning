import { useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const BADGES = ['🌱 N5 Master', '🔥 7-Day Streak', '🃏 Card Collector', '📋 Test Taker', '⭐ XP Milestone']

export default function ProfilePage() {
  const { user } = useAuth()
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({
    username: user?.username ?? 'sakura_learner',
    displayName: 'Sakura Learner',
    targetLevel: 'N3',
    studyGoal: 60,
    nativeLanguage: 'English',
    bio: 'Passionate about Japanese culture and language. Working towards JLPT N3!',
  })

  return (
    <div className="page-shell">

      {/* Profile header */}
      <motion.div
        className="clay-card clay-card--lg"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start', flexWrap: 'wrap' }}>
          {/* Avatar */}
          <div>
            <div className="profile-avatar">
              {(form.displayName[0] ?? 'S').toUpperCase()}
            </div>
            <div style={{ textAlign: 'center', marginTop: 8 }}>
              <span className="badge badge-n3">{form.targetLevel}</span>
            </div>
          </div>

          {/* Info */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <h1 className="page-title" style={{ fontSize: '1.6rem' }}>{form.displayName}</h1>
            <p style={{ color: 'var(--terracotta)', fontWeight: 700, fontSize: '0.88rem', marginTop: 4 }}>@{form.username}</p>
            <p style={{ color: 'var(--muted-plum)', fontSize: '0.88rem', marginTop: 8, lineHeight: 1.6 }}>{form.bio}</p>

            <div style={{ display: 'flex', gap: 20, marginTop: 16, flexWrap: 'wrap' }}>
              {[
                { label: 'Target', val: form.targetLevel },
                { label: 'Daily goal', val: `${form.studyGoal} min` },
                { label: 'From', val: form.nativeLanguage },
                { label: 'Joined', val: 'May 2026' },
              ].map(s => (
                <div key={s.label}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--muted-plum)' }}>{s.label}</div>
                  <div style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--dark-ink)', marginTop: 2 }}>{s.val}</div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <button className="secondary-btn btn-sm" onClick={() => setEditing(e => !e)}>
              {editing ? 'Cancel' : '✎ Edit profile'}
            </button>
          </div>
        </div>

        {/* Edit form */}
        {editing && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            style={{ marginTop: 24, overflow: 'hidden' }}
          >
            <hr className="divider" />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 14, marginTop: 16 }}>
              {[
                { key: 'displayName', label: 'Display name' },
                { key: 'username',    label: 'Username' },
                { key: 'nativeLanguage', label: 'Native language' },
              ].map(f => (
                <label key={f.key} className="field-label">
                  {f.label}
                  <input className="field-input" value={form[f.key]} onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))} />
                </label>
              ))}
              <label className="field-label">
                Target level
                <select className="field-select" value={form.targetLevel} onChange={e => setForm(prev => ({ ...prev, targetLevel: e.target.value }))}>
                  {['N5','N4','N3','N2','N1'].map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </label>
            </div>
            <label className="field-label" style={{ marginTop: 14 }}>
              Bio
              <textarea className="field-input" rows={3} value={form.bio} onChange={e => setForm(prev => ({ ...prev, bio: e.target.value }))} style={{ resize: 'vertical' }} />
            </label>
            <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
              <button className="primary-btn" onClick={() => setEditing(false)}>Save changes</button>
              <button className="ghost-btn"   onClick={() => setEditing(false)}>Cancel</button>
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 14 }}>
        {[
          { icon: '🔥', label: 'Streak',         val: '7 days'  },
          { icon: '⭐', label: 'Total XP',        val: '1,250'   },
          { icon: '字', label: 'Kanji studied',   val: '65'      },
          { icon: '🃏', label: 'Cards reviewed',  val: '420'     },
          { icon: '📋', label: 'Tests taken',     val: '4'       },
          { icon: '✅', label: 'Lessons done',    val: '24'      },
        ].map(s => (
          <motion.div key={s.label} className="stat-card" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            <div className="stat-card-icon">{s.icon}</div>
            <div className="stat-card-value" style={{ fontSize: '1.4rem' }}>{s.val}</div>
            <div className="stat-card-label">{s.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Badges */}
      <motion.div className="clay-card" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <div className="section-header" style={{ marginBottom: 14 }}>
          <span className="section-title">Recent Badges</span>
          <Link to="/achievements" className="ghost-btn btn-sm">All achievements →</Link>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {BADGES.map(b => (
            <span key={b} style={{ padding: '6px 14px', borderRadius: 999, background: 'rgba(201,122,74,0.1)', border: '1px solid rgba(201,122,74,0.2)', color: 'var(--warm-brown)', fontSize: '0.82rem', fontWeight: 700 }}>{b}</span>
          ))}
        </div>
      </motion.div>

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <Link to="/settings"     className="secondary-btn">Settings</Link>
        <Link to="/achievements" className="ghost-btn">Achievements</Link>
        <Link to="/progress"     className="ghost-btn">Progress →</Link>
      </div>

    </div>
  )
}
