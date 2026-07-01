import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { Link } from 'react-router-dom'

/* ── Static data (computed once, not on each render) ─────── */
const STARS = Array.from({ length: 90 }, (_, i) => ({
  id: i,
  x: ((i * 137.508) % 100).toFixed(2),   // golden-angle distribution
  y: ((i * 97.3) % 100).toFixed(2),
  size: 1 + (i % 3) * 0.8,
  dur:  `${2 + (i % 4)}s`,
  delay: `${(i * 0.15) % 3}s`,
}))

const PETALS = Array.from({ length: 20 }, (_, i) => ({
  id: i,
  left: `${4 + (i * 4.8) % 92}%`,
  size: 7 + (i % 5) * 3,
  dur:  5 + (i % 4) * 1.5,
  delay: (i * 0.28) % 5,
  rotStart: (i * 23) % 360,
}))

const FLOAT_KANJI = [
  { char: '学', x: '6%',  y: '22%', size: '3rem',  dur: '7s',  delay: '0s'   },
  { char: '語', x: '12%', y: '62%', size: '2.4rem', dur: '9s',  delay: '1s'   },
  { char: '書', x: '80%', y: '18%', size: '3.2rem', dur: '6s',  delay: '0.5s' },
  { char: '読', x: '74%', y: '58%', size: '2.6rem', dur: '8s',  delay: '2s'   },
  { char: '文', x: '88%', y: '42%', size: '2rem',   dur: '11s', delay: '1.5s' },
  { char: '字', x: '4%',  y: '44%', size: '2.2rem', dur: '10s', delay: '0.8s' },
  { char: '日', x: '50%', y: '82%', size: '2rem',   dur: '8s',  delay: '3s'   },
  { char: '本', x: '40%', y: '14%', size: '1.8rem', dur: '12s', delay: '2.5s' },
]

const FEATURES = [
  { icon: '字', title: 'Kanji Mastery', desc: 'Stroke-by-stroke animation, tracing mode, and SRS review for all JLPT levels.' },
  { icon: '語', title: 'Vocabulary SRS', desc: 'Spaced repetition flashcards that adapt to your memory and surface weak points.' },
  { icon: '文', title: 'Grammar Drills', desc: 'Clear pattern explanations with contextual examples and interactive exercises.' },
  { icon: '📋', title: 'Mock Tests',    desc: 'Full JLPT-format timed tests with analytics and readiness scoring.' },
]

/* ── Torii gate SVG ──────────────────────────────────────── */
function ToriiGate() {
  return (
    <svg
      className="torii-svg"
      viewBox="0 0 440 300"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Kasagi (curved top beam) */}
      <path
        d="M8,72 C70,46 170,60 220,66 C270,60 370,46 432,72"
        stroke="#8b1a1a" strokeWidth="22" strokeLinecap="round"
      />
      <path
        d="M8,72 C70,46 170,60 220,66 C270,60 370,46 432,72"
        stroke="#c0392b" strokeWidth="14" strokeLinecap="round" opacity="0.55"
      />
      {/* Gakuzuka (nameplate area highlight) */}
      <rect x="165" y="56" width="110" height="26" rx="4" fill="#6b1414" opacity="0.45"/>

      {/* Daigashira (pillar caps under kasagi) */}
      <rect x="94" y="68" width="28" height="44" rx="5" fill="#8b1a1a"/>
      <rect x="318" y="68" width="28" height="44" rx="5" fill="#8b1a1a"/>

      {/* Shimagi (second horizontal beam) */}
      <rect x="52" y="100" width="336" height="18" rx="5" fill="#8b1a1a"/>

      {/* Nuki (penetrating beam between pillars) */}
      <rect x="114" y="154" width="212" height="14" rx="4" fill="#8b1a1a"/>

      {/* Left pillar */}
      <rect x="92" y="118" width="32" height="182" rx="7" fill="#8b1a1a"/>
      {/* Right pillar */}
      <rect x="316" y="118" width="32" height="182" rx="7" fill="#8b1a1a"/>

      {/* Glow overlays */}
      <rect x="92"  y="118" width="32" height="182" rx="7" fill="url(#pillarGlow)" opacity="0.4"/>
      <rect x="316" y="118" width="32" height="182" rx="7" fill="url(#pillarGlow)" opacity="0.4"/>

      <defs>
        <linearGradient id="pillarGlow" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%"   stopColor="#c0392b" stopOpacity="0.6"/>
          <stop offset="50%"  stopColor="#ff6b6b" stopOpacity="0.2"/>
          <stop offset="100%" stopColor="#c0392b" stopOpacity="0.6"/>
        </linearGradient>
      </defs>
    </svg>
  )
}

/* ── Progress ring (SVG) ─────────────────────────────────── */
export default function SplashScreenPage() {
  const containerRef = useRef(null)
  const { scrollYProgress } = useScroll({ target: containerRef })
  const heroOpacity  = useTransform(scrollYProgress, [0, 0.3], [1, 0])
  const toriiScale   = useTransform(scrollYProgress, [0, 0.25], [1, 1.12])
  const toriiOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0.6])

  return (
    <div ref={containerRef} className="cinematic-splash">

      {/* ── Stars ─────────────────────────────── */}
      <div className="star-field" aria-hidden="true">
        {STARS.map(s => (
          <div
            key={s.id}
            className="star"
            style={{
              left: `${s.x}%`,
              top:  `${s.y}%`,
              width: s.size,
              height: s.size,
              '--dur':   s.dur,
              '--delay': s.delay,
            }}
          />
        ))}
      </div>

      {/* ── Sakura petals ─────────────────────── */}
      <div className="sakura-layer" aria-hidden="true">
        {PETALS.map(p => (
          <motion.div
            key={p.id}
            className="petal-c"
            style={{ left: p.left, width: p.size, height: p.size }}
            initial={{ y: -30, opacity: 0, rotate: p.rotStart }}
            animate={{
              y: ['0vh', '110vh'],
              x: [0, 28, -18, 34, -8, 12],
              opacity: [0, 0.85, 0.85, 0.6, 0],
              rotate: [p.rotStart, p.rotStart + 480],
            }}
            transition={{
              duration: p.dur,
              delay: p.delay,
              repeat: Infinity,
              ease: 'linear',
              times: [0, 0.05, 0.5, 0.8, 1],
            }}
          />
        ))}
      </div>

      {/* ── Floating kanji ────────────────────── */}
      {FLOAT_KANJI.map(k => (
        <div
          key={k.char}
          className="float-kanji"
          aria-hidden="true"
          style={{
            left: k.x,
            top: k.y,
            fontSize: k.size,
            '--dur': k.dur,
            '--delay': k.delay,
          }}
        >
          {k.char}
        </div>
      ))}

      {/* ── Torii gate ────────────────────────── */}
      <motion.div
        className="torii-layer"
        style={{ scale: toriiScale, opacity: toriiOpacity, width: 'min(520px, 72vw)' }}
      >
        <ToriiGate />
      </motion.div>

      {/* ── Mountain silhouette ───────────────── */}
      <div className="mountain-layer" aria-hidden="true">
        <svg viewBox="0 0 1440 180" preserveAspectRatio="none">
          <path
            d="M0,180 L0,130 L180,72 L360,115 L540,38 L700,95 L860,52 L1020,85 L1180,44 L1340,68 L1440,50 L1440,180 Z"
            fill="#0f0820" opacity="0.96"
          />
          <path
            d="M0,180 L0,155 L240,110 L420,148 L600,80 L780,125 L960,95 L1140,118 L1300,100 L1440,112 L1440,180 Z"
            fill="#07041a"
          />
        </svg>
      </div>

      {/* ── Navigation ────────────────────────── */}
      <motion.nav
        className="cinematic-nav"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="cinematic-brand">
          <span className="c-brand-kanji">語</span>
          <span className="c-brand-text">JLPT Learning</span>
        </div>
        <div className="cinematic-nav-links">
          <Link to="/auth?mode=login" className="c-nav-link">Sign In</Link>
          <Link to="/auth?mode=signup" className="c-cta-btn">Begin Journey</Link>
        </div>
      </motion.nav>

      {/* ── Hero content ──────────────────────── */}
      <motion.div className="cinematic-content" style={{ opacity: heroOpacity }}>
        <motion.p
          className="c-eyebrow"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.7 }}
        >
          日本語学習プラットフォーム
        </motion.p>

        <motion.h1
          className="c-title ink-glow"
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          Master Japanese
          <motion.span
            className="c-title-accent"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.0, duration: 0.6 }}
          >
            From N5 to N1
          </motion.span>
        </motion.h1>

        <motion.p
          className="c-subtitle"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.05, duration: 0.7 }}
        >
          A culturally immersive platform with kanji stroke animation,
          vocabulary SRS, grammar drills, and full JLPT mock tests.
          <br />Beautiful. Structured. Ready for the real exam.
        </motion.p>

        <motion.div
          className="c-actions"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.25, duration: 0.6 }}
        >
          <Link to="/auth?mode=signup" className="c-primary-btn">
            Begin Your Journey
            <span className="c-arrow">→</span>
          </Link>
          <Link to="/auth?mode=login" className="c-secondary-btn">
            Sign In
          </Link>
        </motion.div>
      </motion.div>

      {/* ── Scroll indicator ──────────────────── */}
      <div className="c-scroll" aria-hidden="true">
        <span style={{ fontSize: '1.2rem' }}>↓</span>
        <span>Discover features</span>
      </div>

      {/* ── Features section ──────────────────── */}
      <section
        className="c-features"
        style={{ marginTop: '100vh' }}
      >
        {FEATURES.map((f, i) => (
          <motion.div
            key={f.title}
            className="c-feature-card"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ delay: i * 0.1, duration: 0.55 }}
          >
            <div className="c-feature-icon">{f.icon}</div>
            <div className="c-feature-title">{f.title}</div>
            <div className="c-feature-desc">{f.desc}</div>
          </motion.div>
        ))}
      </section>

      {/* ── Footer strip ──────────────────────── */}
      <footer
        style={{
          position: 'relative',
          zIndex: 10,
          width: '100%',
          textAlign: 'center',
          padding: '32px 24px 48px',
          color: 'rgba(245,240,232,0.3)',
          fontSize: '0.82rem',
        }}
      >
        <p>© 2026 JLPT Learning Platform · 日本語学習 · Built for serious learners</p>
        <div style={{ marginTop: 12, display: 'flex', gap: 20, justifyContent: 'center' }}>
          <Link to="/auth?mode=signup" style={{ color: 'rgba(201,168,76,0.6)', textDecoration: 'none' }}>Get Started</Link>
          <Link to="/auth?mode=login"  style={{ color: 'rgba(245,240,232,0.3)', textDecoration: 'none' }}>Sign In</Link>
        </div>
      </footer>

    </div>
  )
}
