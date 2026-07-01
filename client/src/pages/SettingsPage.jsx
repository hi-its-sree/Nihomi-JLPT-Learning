import { useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

function Toggle({ checked, onChange }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      style={{
        width: 44, height: 24, borderRadius: 999, border: 'none', cursor: 'pointer',
        background: checked ? 'var(--terracotta)' : 'rgba(201,122,74,0.18)',
        position: 'relative', transition: 'background 200ms', flexShrink: 0,
      }}
    >
      <span style={{
        position: 'absolute', top: 3, left: checked ? 23 : 3,
        width: 18, height: 18, borderRadius: '50%', background: 'white',
        transition: 'left 200ms', boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
      }} />
    </button>
  )
}

function SettingRow({ label, desc, children }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, padding: '14px 0', borderBottom: '1px solid rgba(201,122,74,0.08)', flexWrap: 'wrap' }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--dark-ink)' }}>{label}</div>
        {desc && <div style={{ fontSize: '0.78rem', color: 'var(--muted-plum)', marginTop: 2 }}>{desc}</div>}
      </div>
      <div style={{ flexShrink: 0 }}>{children}</div>
    </div>
  )
}

export default function SettingsPage() {
  const { logout } = useAuth()
  const [prefs, setPrefs] = useState({
    dailyReminder:    true,
    streakNotif:      true,
    reviewNotif:      true,
    soundEffects:     false,
    furiganaAuto:     true,
    darkMode:         false,
    romanji:          false,
    dailyGoal:        60,
    reviewBatch:      20,
    targetLevel:      'N3',
  })

  function set(key, val) {
    setPrefs(p => ({ ...p, [key]: val }))
  }

  return (
    <div className="page-shell">

      <motion.div className="clay-card" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <p className="eyebrow">Preferences</p>
        <h1 className="page-title" style={{ marginTop: 8 }}>Settings</h1>
        <p className="page-subtitle" style={{ marginTop: 8 }}>Customize your study experience, notifications, and display preferences.</p>
      </motion.div>

      {/* Study preferences */}
      <motion.div className="clay-card" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <div className="section-title" style={{ marginBottom: 4 }}>Study Settings</div>

        <SettingRow label="Target JLPT Level" desc="Adapts content difficulty and study plan">
          <select className="field-select" value={prefs.targetLevel} onChange={e => set('targetLevel', e.target.value)} style={{ width: 90 }}>
            {['N5','N4','N3','N2','N1'].map(l => <option key={l} value={l}>{l}</option>)}
          </select>
        </SettingRow>

        <SettingRow label="Daily study goal" desc="Minutes per day to study">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <input
              type="range" min={15} max={120} step={15}
              value={prefs.dailyGoal}
              onChange={e => set('dailyGoal', Number(e.target.value))}
              style={{ width: 100 }}
            />
            <span style={{ minWidth: 40, fontWeight: 700, fontSize: '0.88rem', color: 'var(--dark-ink)' }}>{prefs.dailyGoal}m</span>
          </div>
        </SettingRow>

        <SettingRow label="SRS batch size" desc="Cards to review per session">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <input
              type="range" min={5} max={50} step={5}
              value={prefs.reviewBatch}
              onChange={e => set('reviewBatch', Number(e.target.value))}
              style={{ width: 100 }}
            />
            <span style={{ minWidth: 30, fontWeight: 700, fontSize: '0.88rem', color: 'var(--dark-ink)' }}>{prefs.reviewBatch}</span>
          </div>
        </SettingRow>

        <SettingRow label="Auto-show furigana" desc="Show readings above kanji automatically">
          <Toggle checked={prefs.furiganaAuto} onChange={v => set('furiganaAuto', v)} />
        </SettingRow>

        <SettingRow label="Show romaji" desc="Display romanized readings alongside kana">
          <Toggle checked={prefs.romanji} onChange={v => set('romanji', v)} />
        </SettingRow>

        <SettingRow label="Sound effects" desc="Play audio feedback during exercises">
          <Toggle checked={prefs.soundEffects} onChange={v => set('soundEffects', v)} />
        </SettingRow>
      </motion.div>

      {/* Notifications */}
      <motion.div className="clay-card" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <div className="section-title" style={{ marginBottom: 4 }}>Notifications</div>

        <SettingRow label="Daily study reminder" desc="Get reminded to study at your preferred time">
          <Toggle checked={prefs.dailyReminder} onChange={v => set('dailyReminder', v)} />
        </SettingRow>

        <SettingRow label="Streak alerts" desc="Notify when your streak is at risk">
          <Toggle checked={prefs.streakNotif} onChange={v => set('streakNotif', v)} />
        </SettingRow>

        <SettingRow label="SRS review ready" desc="Alert when flashcard reviews are scheduled">
          <Toggle checked={prefs.reviewNotif} onChange={v => set('reviewNotif', v)} />
        </SettingRow>
      </motion.div>

      {/* Account */}
      <motion.div className="clay-card" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <div className="section-title" style={{ marginBottom: 4 }}>Account</div>

        <SettingRow label="Profile" desc="Edit your display name, bio, and avatar">
          <Link to="/profile" className="ghost-btn btn-sm">Edit profile →</Link>
        </SettingRow>

        <SettingRow label="Change password" desc="Update your account password">
          <button className="ghost-btn btn-sm">Change →</button>
        </SettingRow>

        <SettingRow label="Export data" desc="Download your learning history as CSV">
          <button className="secondary-btn btn-sm">Export</button>
        </SettingRow>

        <SettingRow label="Sign out" desc="Log out of this device">
          <button className="btn-danger primary-btn btn-sm" onClick={logout}>Sign out</button>
        </SettingRow>
      </motion.div>

      <div style={{ display: 'flex', gap: 10 }}>
        <button className="primary-btn" onClick={() => {}}>Save all settings</button>
        <Link to="/contact" className="ghost-btn">Need help? →</Link>
      </div>

    </div>
  )
}
