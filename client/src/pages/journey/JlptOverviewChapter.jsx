import { motion } from 'framer-motion'
import ChapterHeader from '../../components/journey/ChapterHeader'
import AchievementUnlockModal from '../../components/journey/AchievementUnlockModal'
import XPToast from '../../components/journey/XPToast'
import { useChapterCompletion } from '../../components/journey/useChapterCompletion'
import { CHAPTERS } from './content/chapters'

const LEVELS = [
  { code: 'N5', label: 'Beginner', jp: '初級', icon: '🌱', color: '#059669', desc: 'Base camp. Hiragana, katakana, and everyday survival phrases.', altitude: '5,200m' },
  { code: 'N4', label: 'Elementary', jp: '基礎', icon: '🌿', color: '#0284c7', desc: 'The first real climb. Daily conversation and simple grammar patterns.', altitude: '6,400m' },
  { code: 'N3', label: 'Intermediate', jp: '中級', icon: '🏮', color: '#7c3aed', desc: 'The halfway ridge. Reading news headlines, following natural speech.', altitude: '7,200m' },
  { code: 'N2', label: 'Advanced', jp: '上中級', icon: '⛩️', color: '#b45309', desc: 'The professional benchmark. Newspapers, business, formal writing.', altitude: '8,100m' },
  { code: 'N1', label: 'Near-Native', jp: '上級', icon: '🏯', color: '#be123c', desc: 'The summit. Literature, academic writing, near-native fluency.', altitude: '8,849m' },
]

export default function JlptOverviewChapter() {
  const { finish, unlockedBadge, closeBadgeModal, showXpToast } = useChapterCompletion('jlpt-overview', '/journey/writing-systems')

  return (
    <div className="journey-content-wrap">
      <ChapterHeader chapter={CHAPTERS['jlpt-overview']} />

      <motion.div className="clay-card" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 900, color: 'var(--dark-ink)', marginBottom: 10 }}>What is the JLPT?</h2>
        <p style={{ color: 'var(--muted-plum)', fontSize: '0.9rem', lineHeight: 1.8 }}>
          The <strong>JLPT (Japanese-Language Proficiency Test)</strong> is the most widely recognized way to measure your Japanese ability.
          It has five levels — think of them as five camps on a mountain climb from complete beginner (N5) to near-native mastery (N1).
          Each level you clear unlocks new abilities, just like leveling up in an RPG.
        </p>
      </motion.div>

      <div style={{ position: 'relative', padding: '12px 0' }}>
        <div style={{ position: 'relative', display: 'flex', flexDirection: 'column-reverse', gap: 14 }}>
          {LEVELS.map((level, i) => (
            <motion.div key={level.code}
              initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ delay: i * 0.08, duration: 0.4 }}
              className="clay-card clay-card--sm"
              style={{ borderLeft: `4px solid ${level.color}`, display: 'flex', alignItems: 'center', gap: 16 }}
            >
              <div style={{
                width: 46, height: 46, borderRadius: '50%', flexShrink: 0,
                background: `linear-gradient(135deg, ${level.color}, var(--accent))`,
                display: 'grid', placeItems: 'center', fontSize: '1.3rem',
                boxShadow: `0 0 16px ${level.color}55`,
              }}>
                {level.icon}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, flexWrap: 'wrap' }}>
                  <span style={{ fontWeight: 900, fontSize: '1.2rem', color: level.color }}>{level.code}</span>
                  <span style={{ fontWeight: 800, fontSize: '0.88rem', color: 'var(--dark-ink)' }}>{level.label}</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--muted-plum)' }}>{level.jp}</span>
                  <span style={{ marginLeft: 'auto', fontSize: '0.7rem', fontWeight: 700, color: 'var(--muted-plum)' }}>⛰ {level.altitude}</span>
                </div>
                <p style={{ fontSize: '0.82rem', color: 'var(--muted-plum)', marginTop: 4, lineHeight: 1.6 }}>{level.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <motion.div className="notice notice-gold" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
        <strong>Where you're standing now:</strong> You haven't started climbing yet — this Beginner Journey is base camp preparation.
        By the end, you'll be ready to start N5 with real confidence instead of walking in cold.
      </motion.div>

      <motion.div className="clay-card" style={{ textAlign: 'center' }} initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 900, color: 'var(--dark-ink)', marginBottom: 8 }}>Ready to see the map up close?</h2>
        <p style={{ color: 'var(--muted-plum)', fontSize: '0.85rem', marginBottom: 16 }}>
          You can always revisit the full roadmap from your dashboard later.
        </p>
        <button type="button" className="primary-btn" onClick={finish}>Continue →</button>
      </motion.div>

      <XPToast xp={CHAPTERS['jlpt-overview'].xp} visible={showXpToast} />
      <AchievementUnlockModal open={!!unlockedBadge} badge={unlockedBadge} onClose={closeBadgeModal} />
    </div>
  )
}
