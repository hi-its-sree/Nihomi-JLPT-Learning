import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import api from '../lib/api'

const EMPTY_FORM = {
  username: '',
  displayName: '',
  targetLevel: 'N5',
  studyGoal: 45,
  nativeLanguage: 'English',
  bio: '',
}

export default function ProfilePage() {
  const { user } = useAuth()
  const [editing, setEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [profile, setProfile] = useState(null)
  const [achievements, setAchievements] = useState([])
  const [form, setForm] = useState(EMPTY_FORM)

  useEffect(() => {
    let isActive = true

    const loadProfile = async () => {
      try {
        setLoading(true)
        const { data } = await api.get('/api/v1/user/profile')
        if (!isActive) return

        const nextForm = {
          username: data.username ?? '',
          displayName: data.displayName ?? data.username ?? user?.username ?? '',
          targetLevel: data.targetLevel ?? 'N5',
          studyGoal: data.studyGoal ?? 45,
          nativeLanguage: data.nativeLanguage ?? 'English',
          bio: data.bio ?? '',
        }

        setProfile(data)
        setForm(nextForm)
        setError('')
        // load achievements separately
        try {
          const { data: ach } = await api.get('/api/v1/user/achievements')
          if (isActive) setAchievements(ach.achievements ?? [])
        } catch {
          // ignore
        }
      } catch (err) {
        if (isActive) {
          setError('Unable to load your live profile right now.')
        }
      } finally {
        if (isActive) {
          setLoading(false)
        }
      }
    }

    loadProfile()
    const intervalId = window.setInterval(loadProfile, 30000)

    return () => {
      isActive = false
      window.clearInterval(intervalId)
    }
  }, [user?.id])

  const handleSave = async () => {
    try {
      const { data } = await api.patch('/api/v1/user/profile', {
        username: form.username,
        studyLevel: form.targetLevel,
      })

      const nextProfile = {
        ...(profile ?? {}),
        username: data.user?.username ?? form.username,
        displayName: data.user?.username ?? form.displayName,
        targetLevel: data.user?.studyLevel ?? form.targetLevel,
        studyGoal: form.studyGoal,
        nativeLanguage: form.nativeLanguage,
        bio: form.bio,
      }

      setProfile(nextProfile)
      setForm(prev => ({
        ...prev,
        username: data.user?.username ?? prev.username,
        displayName: data.user?.username ?? prev.displayName,
        targetLevel: data.user?.studyLevel ?? prev.targetLevel,
      }))
      setEditing(false)
      setError('')
    } catch {
      setError('Could not save your profile changes.')
    }
  }

  const stats = profile?.stats ?? {
    streak: 0,
    totalXP: 0,
    kanjiStudied: 0,
    cardsReviewed: 0,
    testsTaken: 0,
    lessonsCompleted: 0,
    achievementsEarned: 0,
  }

  const joinedLabel = profile?.joinedDate
    ? new Date(profile.joinedDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    : 'Recently joined'
  const avatarLetter = (form.displayName?.trim?.()[0] || form.username?.trim?.()[0] || 'U').toUpperCase()

  const earnedBadges = achievements && achievements.length > 0 ? achievements : null

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
              {avatarLetter}
            </div>
            <div style={{ textAlign: 'center', marginTop: 8 }}>
              <span className="badge badge-n3">{form.targetLevel}</span>
            </div>
          </div>

          {/* Info */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <h1 className="page-title" style={{ fontSize: '1.6rem' }}>{form.displayName || form.username || 'Learner'}</h1>
            <p style={{ color: 'var(--terracotta)', fontWeight: 700, fontSize: '0.88rem', marginTop: 4 }}>@{form.username || 'learner'}</p>
            <p style={{ color: 'var(--muted-plum)', fontSize: '0.88rem', marginTop: 8, lineHeight: 1.6 }}>{form.bio || `Working toward JLPT ${form.targetLevel}.`}</p>

            <div style={{ display: 'flex', gap: 20, marginTop: 16, flexWrap: 'wrap' }}>
              {[
                { label: 'Target', val: form.targetLevel },
                { label: 'Daily goal', val: `${form.studyGoal} min` },
                { label: 'From', val: form.nativeLanguage },
                { label: 'Joined', val: joinedLabel },
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
              <button className="primary-btn" onClick={handleSave}>Save changes</button>
              <button className="ghost-btn"   onClick={() => setEditing(false)}>Cancel</button>
            </div>
          </motion.div>
        )}
      </motion.div>

      {error && (
        <div className="clay-card" style={{ marginBottom: 14, padding: '10px 14px', color: 'var(--muted-plum)' }}>
          {error}
        </div>
      )}

      {loading && !profile && (
        <div className="clay-card" style={{ marginBottom: 14, padding: '14px', color: 'var(--muted-plum)' }}>
          Loading your live profile…
        </div>
      )}

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 14 }}>
        {[
          { icon: '🔥', label: 'Streak',         val: `${stats.streak} days` },
          { icon: '⭐', label: 'Total XP',        val: stats.totalXP.toLocaleString() },
          { icon: '字', label: 'Kanji studied',   val: stats.kanjiStudied.toString() },
          { icon: '🃏', label: 'Cards reviewed',  val: stats.cardsReviewed.toString() },
          { icon: '📋', label: 'Tests taken',     val: stats.testsTaken.toString() },
          { icon: '✅', label: 'Lessons done',    val: stats.lessonsCompleted.toString() },
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
        {earnedBadges && earnedBadges.length > 0 ? (
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {earnedBadges.map(b => (
              <div key={b.id} title={b.desc} style={{ padding: '10px 14px', borderRadius: 999, background: 'rgba(201,122,74,0.1)', border: '1px solid rgba(201,122,74,0.2)', color: 'var(--warm-brown)', fontSize: '0.82rem', fontWeight: 700 }}>
                <span style={{ marginRight: 6 }}>{b.icon}</span>
                {b.title}
              </div>
            ))}
          </div>
        ) : (
          <div style={{ color: 'var(--muted-plum)', lineHeight: 1.6 }}>
            Your first badge appears when you start learning, practice regularly, and take mock tests. Keep going — every lesson counts.
          </div>
        )}
      </motion.div>

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <Link to="/settings"     className="secondary-btn">Settings</Link>
        <Link to="/achievements" className="ghost-btn">Achievements</Link>
        <Link to="/progress"     className="ghost-btn">Progress →</Link>
      </div>

    </div>
  )
}
