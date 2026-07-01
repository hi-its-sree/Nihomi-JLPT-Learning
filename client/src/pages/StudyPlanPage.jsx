import { useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

const WEEK = [
  {
    day: 'Mon',
    date: '30',
    today: true,
    tasks: [
      { icon: '字', label: 'Kanji Review',    count: '5 cards', link: '/kanji',      done: true  },
      { icon: '語', label: 'Vocab SRS',       count: '20 cards', link: '/flashcards', done: true  },
      { icon: '文', label: 'Grammar Drill',   count: '2 patterns', link: '/grammar',  done: false },
      { icon: '👂', label: 'Listening',       count: '1 passage', link: '/practice',  done: false },
    ],
  },
  {
    day: 'Tue',
    date: '1',
    tasks: [
      { icon: '字', label: 'Kanji — New',    count: '3 kanji', link: '/kanji',      done: false },
      { icon: '語', label: 'Vocab SRS',      count: '15 cards', link: '/flashcards', done: false },
      { icon: '📖', label: 'Reading',        count: '1 passage', link: '/practice',  done: false },
    ],
  },
  {
    day: 'Wed',
    date: '2',
    tasks: [
      { icon: '📋', label: 'Mock Test',      count: 'N3 Section', link: '/tests',    done: false },
      { icon: '語', label: 'Vocab SRS',      count: '18 cards', link: '/flashcards', done: false },
      { icon: '文', label: 'Grammar',        count: '3 patterns', link: '/grammar',  done: false },
    ],
  },
  {
    day: 'Thu',
    date: '3',
    tasks: [
      { icon: '字', label: 'Kanji Review',   count: '8 cards', link: '/kanji',      done: false },
      { icon: '語', label: 'Vocab SRS',      count: '20 cards', link: '/flashcards', done: false },
      { icon: '👂', label: 'Listening',      count: '2 passages', link: '/practice', done: false },
    ],
  },
  {
    day: 'Fri',
    date: '4',
    tasks: [
      { icon: '📖', label: 'Reading',        count: '2 passages', link: '/practice', done: false },
      { icon: '語', label: 'Vocab SRS',      count: '15 cards', link: '/flashcards', done: false },
      { icon: '文', label: 'Grammar',        count: '2 patterns', link: '/grammar',  done: false },
    ],
  },
  {
    day: 'Sat',
    date: '5',
    tasks: [
      { icon: '📋', label: 'Full Mock Test', count: 'N3 — 105 min', link: '/tests',  done: false },
      { icon: '📈', label: 'Review results', count: 'Weak points',   link: '/progress', done: false },
    ],
  },
  {
    day: 'Sun',
    date: '6',
    tasks: [
      { icon: '🎯', label: 'Weak point drills', count: 'Based on test', link: '/practice', done: false },
      { icon: '語', label: 'Vocab SRS',          count: '10 cards',     link: '/flashcards', done: false },
    ],
  },
]

export default function StudyPlanPage() {
  const [checked, setChecked] = useState(new Set(['Mon-0', 'Mon-1']))

  function toggle(key) {
    setChecked(prev => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  const todayTasks = WEEK[0].tasks
  const todayDone  = todayTasks.filter((_, i) => checked.has(`Mon-${i}`)).length

  return (
    <div className="page-shell">

      <motion.div className="clay-card clay-card--lg" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <p className="eyebrow">Personalized Plan</p>
        <h1 className="page-title" style={{ marginTop: 8 }}>This Week's Study Plan</h1>
        <p className="page-subtitle" style={{ marginTop: 10 }}>
          Balanced daily sessions targeting your current level (N3) and weak points. Designed to keep you on track for exam day.
        </p>
        <div style={{ display: 'flex', gap: 10, marginTop: 16, flexWrap: 'wrap' }}>
          <Link to="/practice" className="primary-btn">Start Today's Session →</Link>
          <Link to="/progress" className="secondary-btn">View progress</Link>
        </div>
      </motion.div>

      {/* Today highlighted */}
      <motion.div className="clay-card" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} style={{ borderLeft: '3px solid var(--terracotta)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
          <div>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--terracotta)' }}>Today · Monday, June 30</span>
            <h2 className="section-title" style={{ marginTop: 4 }}>Today's Tasks</h2>
          </div>
          <span style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--muted-plum)' }}>{todayDone}/{todayTasks.length} done</span>
        </div>
        <div className="progress-bar-wrap" style={{ marginBottom: 16 }}>
          <motion.div className="progress-bar-fill" animate={{ width: `${(todayDone / todayTasks.length) * 100}%` }} transition={{ duration: 0.5 }} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {todayTasks.map((t, i) => {
            const key   = `Mon-${i}`
            const done  = checked.has(key)
            return (
              <Link key={i} to={t.link} className="plan-item" style={{ textDecoration: 'none', opacity: done ? 0.6 : 1 }}>
                <button
                  className="plan-task-check"
                  style={{ background: done ? 'var(--terracotta)' : 'transparent', borderColor: done ? 'var(--terracotta)' : 'rgba(201,122,74,0.3)' }}
                  onClick={e => { e.preventDefault(); toggle(key) }}
                >
                  {done ? '✓' : ''}
                </button>
                <span className="plan-item-icon">{t.icon}</span>
                <div className="plan-item-text">
                  <div className="plan-item-name" style={{ textDecoration: done ? 'line-through' : 'none' }}>{t.label}</div>
                  <div className="plan-item-count">{t.count}</div>
                </div>
              </Link>
            )
          })}
        </div>
      </motion.div>

      {/* Rest of week */}
      <div>
        <div className="section-header" style={{ marginBottom: 16 }}>
          <span className="section-title">Rest of This Week</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 14 }}>
          {WEEK.slice(1).map((day, di) => (
            <motion.div
              key={day.day}
              className="plan-day-card"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + di * 0.06 }}
            >
              <div className="plan-day-label">{day.day} · June {day.date}</div>
              <div className="plan-day-tasks">
                {day.tasks.map((t, i) => (
                  <Link key={i} to={t.link} className="plan-task" style={{ textDecoration: 'none' }}>
                    <span>{t.icon}</span>
                    <span style={{ color: 'var(--dark-ink)', fontSize: '0.85rem' }}>{t.label}</span>
                  </Link>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Level goal */}
      <motion.div className="clay-card" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ fontSize: '2.5rem' }}>🎯</div>
          <div style={{ flex: 1 }}>
            <div className="section-title">Goal: Pass JLPT N3</div>
            <p style={{ fontSize: '0.88rem', color: 'var(--muted-plum)', marginTop: 4, lineHeight: 1.6 }}>
              At your current pace you will be exam-ready in approximately 8 weeks.
              Maintain your streak and focus on listening to hit your target.
            </p>
          </div>
          <Link to="/progress" className="primary-btn" style={{ flexShrink: 0 }}>Track readiness →</Link>
        </div>
      </motion.div>

    </div>
  )
}
