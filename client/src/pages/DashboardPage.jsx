import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import api from '../lib/api'

/* ── SVG Progress Ring ───────────────────────────────────── */
function ProgressRing({ pct = 0, size = 88, stroke = 9, color = '#c97a4a', label = '' }) {
  const r   = (size - stroke) / 2
  const c   = 2 * Math.PI * r
  const off = c - (pct / 100) * c
  return (
    <div className="ring-wrap" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(201,122,74,0.12)" strokeWidth={stroke} />
        <motion.circle
          cx={size / 2} cy={size / 2} r={r}
          fill="none" stroke={color} strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: off }}
          transition={{ duration: 1.4, ease: [0.25, 0.46, 0.45, 0.94], delay: 0.3 }}
        />
      </svg>
      <div className="ring-label">
        <div style={{ fontSize: '1.05rem', fontWeight: 900, color: 'var(--dark-ink)' }}>{pct}%</div>
        {label && <div style={{ fontSize: '0.62rem', color: 'var(--muted-plum)', marginTop: 1 }}>{label}</div>}
      </div>
    </div>
  )
}

/* ── Japanese time greeting ──────────────────────────────── */
function getGreeting() {
  const h = new Date().getHours()
  if (h < 5)  return { jp: 'こんばんは', en: 'Good evening' }
  if (h < 12) return { jp: 'おはようございます', en: 'Good morning' }
  if (h < 17) return { jp: 'こんにちは', en: 'Good afternoon' }
  return { jp: 'こんばんは', en: 'Good evening' }
}

const QUICK = [
  { icon: '▶', label: 'Continue Lesson',  to: '/lessons',    bg: 'linear-gradient(135deg,rgba(201,122,74,0.14),rgba(215,125,77,0.08))' },
  { icon: '🃏', label: 'Flashcard SRS',   to: '/flashcards', bg: 'linear-gradient(135deg,rgba(139,111,139,0.14),rgba(155,120,155,0.08))' },
  { icon: '📋', label: 'Mock Test',       to: '/tests',      bg: 'linear-gradient(135deg,rgba(125,141,106,0.14),rgba(140,155,120,0.08))' },
  { icon: '📈', label: 'My Progress',     to: '/progress',   bg: 'linear-gradient(135deg,rgba(91,143,168,0.14),rgba(100,155,180,0.08))' },
]

export default function DashboardPage() {
  const { user } = useAuth()
  const [dashboardData, setDashboardData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const greeting = getGreeting()

  useEffect(() => {
    let isActive = true

    const loadDashboard = async () => {
      try {
        setLoading(true)
        const { data } = await api.get('/api/v1/dashboard')
        if (isActive) {
          setDashboardData(data)
          setError('')
        }
      } catch (err) {
        if (isActive) {
          setDashboardData(null)
          setError('Unable to load live dashboard data right now.')
        }
      } finally {
        if (isActive) setLoading(false)
      }
    }

    loadDashboard()
    const intervalId = window.setInterval(loadDashboard, 30000)

    return () => {
      isActive = false
      window.clearInterval(intervalId)
    }
  }, [user?.id])

  const stats = dashboardData?.stats ?? { streak: 0, xp: 0, readiness: 0, lessonsCompleted: 0 }
  const todayPlan = dashboardData?.todayPlan ?? []
  const mastery = dashboardData?.mastery ?? []
  const recentActivity = dashboardData?.recentActivity ?? []
  const target = dashboardData?.target ?? null
  const isNewUser = dashboardData?.isNewUser

  const cardVariants = {
    hidden:  { opacity: 0, y: 20 },
    visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.07, duration: 0.45 } }),
  }

  return (
    <div className="page-shell">

      {/* ── Welcome header ──────────────────── */}
      <motion.div
        className="dashboard-welcome"
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div>
          <h1 className="dashboard-greeting">
            {greeting.jp}、{user?.username ?? 'Learner'} 👋
          </h1>
          <p className="dashboard-date">{greeting.en} · {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
          <div className="dashboard-streak-badge">
            🔥 {stats.streak}-day streak
          </div>
          {target && (
            <div style={{ fontSize: '0.8rem', color: 'var(--muted-plum)', textAlign: 'right' }}>
              Target: <strong>{target.level}</strong> · {target.weeklyGoal} XP/week
            </div>
          )}
          {isNewUser && (
            <div style={{ marginTop: 6, fontSize: '0.82rem', color: 'var(--muted-plum)', textAlign: 'right', maxWidth: 260 }}>
              New here? Your weekly XP goal is how much you should aim to earn each week — hit small daily targets and the plan will fill out as you complete lessons.
            </div>
          )}
        </div>
      </motion.div>

      {error && (
        <div className="clay-card" style={{ marginBottom: 16, padding: '12px 16px', color: 'var(--muted-plum)' }}>
          {error}
        </div>
      )}

      {/* ── Stats row ───────────────────────── */}
      <div className="stats-grid">
        {[
          { label: 'Readiness Score', icon: '🎯', content: <ProgressRing pct={stats.readiness} size={72} stroke={8} />, sub: target?.level ? `${target.level} target` : 'Target based on your profile' },
          { label: 'Total XP',        icon: '⭐', value: stats.xp.toLocaleString(), sub: target?.weeklyGoal ? `${target.weeklyGoal} XP weekly goal` : 'Live progress' },
          { label: 'Study Streak',    icon: '🔥', value: `${stats.streak}d`,        sub: stats.streak > 0 ? 'Keep it going!' : 'Start your first streak' },
          { label: 'Lessons Done',    icon: '✅', value: stats.lessonsCompleted,     sub: stats.lessonsCompleted > 0 ? 'Live from your activity' : 'Complete your first lesson' },
        ].map((s, i) => (
          <motion.div
            key={s.label}
            className="stat-card"
            custom={i}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
          >
            <div className="stat-card-label">{s.label}</div>
            {s.content
              ? <div style={{ marginTop: 4 }}>{s.content}</div>
              : <div className="stat-card-value">{s.value}</div>
            }
            <div className="stat-card-sub">{s.sub}</div>
          </motion.div>
        ))}
      </div>

      {/* ── Body grid ───────────────────────── */}
      <div className="dashboard-body">

        {/* Today's plan */}
        <motion.div
          className="clay-card"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.35, duration: 0.5 }}
        >
          <div className="section-header" style={{ marginBottom: 16 }}>
            <span className="section-title">Today's Study Plan</span>
            <Link to="/study-plan" className="ghost-btn btn-sm">Full plan →</Link>
          </div>
          {target && (
            <div style={{ marginBottom: 12, color: 'var(--muted-plum)', fontSize: '0.84rem', lineHeight: 1.5 }}>
              {target.description}
            </div>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {loading ? (
              <div style={{ color: 'var(--muted-plum)' }}>Loading your live study plan…</div>
            ) : todayPlan.length > 0 ? (
              todayPlan.map(item => (
                  item.cta ? (
                    <div key={item.id} className="plan-item" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <span className="plan-item-icon">{item.icon}</span>
                        <div className="plan-item-text">
                          <div className="plan-item-name">{item.title}</div>
                          <div className="plan-item-count">{item.duration} • +{item.xp} XP</div>
                        </div>
                      </div>
                      <Link to={item.cta} className="primary-btn">Get started</Link>
                    </div>
                  ) : (
                    <div key={item.id} className="plan-item">
                      <span className="plan-item-icon">{item.icon}</span>
                      <div className="plan-item-text">
                        <div className="plan-item-name">{item.title}</div>
                        <div className="plan-item-count">{item.duration} • +{item.xp} XP</div>
                      </div>
                      <span className={`plan-item-badge ${item.done ? 'done' : ''}`}>{item.done ? 'Done' : 'Today'}</span>
                    </div>
              ))
            )) : (
              <div style={{ color: 'var(--muted-plum)' }}>
                {target?.level
                  ? `Your ${target.level} plan will appear here as soon as you start learning.`
                  : 'Your personalized plan will appear here as soon as you start learning.'}
              </div>
            )}
          </div>
        </motion.div>

        {/* Mastery progress */}
        <motion.div
          className="clay-card"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <div className="section-header" style={{ marginBottom: 20 }}>
            <span className="section-title">Mastery Progress</span>
            <Link to="/progress" className="ghost-btn btn-sm">Details →</Link>
          </div>
          <div className="mastery-row">
            {loading ? (
              <div style={{ color: 'var(--muted-plum)' }}>Loading mastery data…</div>
            ) : mastery.length > 0 ? (
              mastery.map(m => (
                <div key={m.label} className="mastery-item">
                  <div className="mastery-header">
                    <span className="mastery-label">{m.label}</span>
                    <span className="mastery-count">{m.done} / {m.total}</span>
                  </div>
                  <div className="progress-bar-wrap">
                    <motion.div
                      className="progress-bar-fill"
                      style={{ background: `linear-gradient(90deg, ${m.color}, ${m.color}cc)` }}
                      initial={{ width: 0 }}
                      animate={{ width: `${m.pct}%` }}
                      transition={{ duration: 1.2, delay: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <div style={{ color: 'var(--muted-plum)' }}>
                {target?.level
                  ? `Mastery for ${target.level} will build as you practice vocabulary, grammar, and reading.`
                  : 'Mastery will build as you practice vocabulary, grammar, and reading.'}
              </div>
            )}
          </div>

          <hr className="divider" style={{ margin: '20px 0' }} />

          {/* JLPT Readiness summary */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <ProgressRing pct={stats.readiness} size={80} color="#c97a4a" label="Ready" />
            <div>
              <div style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--dark-ink)' }}>
                {target?.level ? `${target.level} Readiness` : 'N3 Readiness'}
              </div>
              <div style={{ fontSize: '0.82rem', color: 'var(--muted-plum)', marginTop: 4, lineHeight: 1.5 }}>
                {target?.focus ? `${target.focus}` : (stats.readiness >= 80
                  ? 'You are exam-ready! Keep reviewing weak points.'
                  : stats.readiness >= 60
                  ? 'Good progress. Focus on grammar and listening.'
                  : 'Keep studying. More practice needed.')}
              </div>
              <Link to="/progress" className="ghost-btn btn-sm" style={{ marginTop: 8, display: 'inline-flex' }}>
                View analytics →
              </Link>
            </div>
          </div>
        </motion.div>
      </div>

      {/* ── Quick actions ───────────────────── */}
      <div>
        <div className="section-header" style={{ marginBottom: 16 }}>
          <span className="section-title">Quick Actions</span>
        </div>
        <div className="quick-actions">
          {QUICK.map((q, i) => (
            <motion.div key={q.label} custom={i} variants={cardVariants} initial="hidden" animate="visible">
              <Link to={q.to} className="quick-action-card" style={{ background: q.bg }}>
                <span className="quick-action-icon">{q.icon}</span>
                <span className="quick-action-label">{q.label}</span>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ── Recent activity ─────────────────── */}
      <motion.div
        className="clay-card"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.5 }}
      >
        <div className="section-header" style={{ marginBottom: 16 }}>
          <span className="section-title">Recent Activity</span>
          <Link to="/progress" className="ghost-btn btn-sm">Full log →</Link>
        </div>
        <div>
          {loading ? (
            <div style={{ color: 'var(--muted-plum)' }}>Loading recent activity…</div>
          ) : recentActivity.length > 0 ? (
            recentActivity.map((r, i) => (
              <motion.div
                key={`${r.label}-${i}`}
                className="activity-item"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 + i * 0.08 }}
              >
                <div className="activity-dot" />
                <div>
                  <div className="activity-text">{r.label}</div>
                  <div className="activity-time">{r.time} • +{r.xp} XP</div>
                </div>
              </motion.div>
            ))
          ) : (
            <div style={{ color: 'var(--muted-plum)' }}>No recent activity yet.</div>
          )}
        </div>
      </motion.div>

    </div>
  )
}
