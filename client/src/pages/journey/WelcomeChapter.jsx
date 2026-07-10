import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ChapterHeader from '../../components/journey/ChapterHeader'
import AchievementUnlockModal from '../../components/journey/AchievementUnlockModal'
import XPToast from '../../components/journey/XPToast'
import { useChapterCompletion } from '../../components/journey/useChapterCompletion'
import { CHAPTERS } from './content/chapters'

const SCENES = [
  {
    icon: '🛬', title: 'You have just landed in Japan', jp: 'ようこそ日本へ',
    body: 'The plane doors open. Announcements play softly in Japanese. Around you, signs in three different scripts guide travelers toward customs, taxis, and trains.',
  },
  {
    icon: '🈁', title: 'Everywhere, a new kind of writing', jp: '文字がいっぱい',
    body: 'Hiragana curls softly across signage. Katakana spells out foreign brands. Kanji — dense, meaningful characters — mark stations, exits, and shop names. It looks like a puzzle. Soon, it will feel like reading.',
  },
  {
    icon: '👋', title: 'Someone greets you', jp: 'こんにちは！',
    body: '"Konnichiwa!" a shopkeeper says with a smile. You don\'t understand every word yet — but you will. That is what this journey is for.',
  },
  {
    icon: '🗼', title: 'Tokyo stretches out before you', jp: '東京',
    body: 'Neon signs, quiet shrines, bullet trains, and convenience stores on every corner. Japan is enormous and layered — and Japanese is your key to all of it.',
  },
]

const WHY_LEARN = [
  { icon: '✈️', title: 'Travel', desc: 'Navigate Japan like a local — order food, ask directions, read signs without a translator app.' },
  { icon: '🎬', title: 'Anime & Manga', desc: 'Understand jokes, wordplay, and nuance that subtitles quietly leave behind.' },
  { icon: '💼', title: 'Work', desc: 'Open doors to jobs, business, and study opportunities across Japan and Japanese companies worldwide.' },
  { icon: '⛩', title: 'Culture', desc: 'Appreciate literature, film, festivals, and history in their original language.' },
  { icon: '💬', title: 'Communication', desc: 'Build real friendships and relationships with native speakers, not just tourist-level exchanges.' },
  { icon: '🧠', title: 'Your Brain', desc: 'Learning a structurally different language is one of the best workouts your mind can get.' },
]

export default function WelcomeChapter() {
  const [sceneIndex, setSceneIndex] = useState(0)
  const [showWhy, setShowWhy] = useState(false)
  const { finish, unlockedBadge, closeBadgeModal, showXpToast } = useChapterCompletion('welcome', '/journey/jlpt-overview')

  const scene = SCENES[sceneIndex]
  const isLastScene = sceneIndex === SCENES.length - 1

  function nextScene() {
    if (isLastScene) setShowWhy(true)
    else setSceneIndex((i) => i + 1)
  }

  return (
    <div className="journey-content-wrap">
      <ChapterHeader chapter={CHAPTERS.welcome} />

      {!showWhy ? (
        <AnimatePresence mode="wait">
          <motion.div key={sceneIndex} className="clay-card clay-card--lg"
            initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.4 }}
            style={{ textAlign: 'center' }}
          >
            <motion.div style={{ fontSize: '4rem', marginBottom: 8 }}
              initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.1, type: 'spring' }}>
              {scene.icon}
            </motion.div>
            <p style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--terracotta)', marginBottom: 6 }}>{scene.jp}</p>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 900, color: 'var(--dark-ink)', marginBottom: 12 }}>{scene.title}</h2>
            <p style={{ color: 'var(--muted-plum)', fontSize: '0.92rem', lineHeight: 1.8, maxWidth: 480, margin: '0 auto 24px' }}>{scene.body}</p>

            <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginBottom: 20 }}>
              {SCENES.map((_, i) => (
                <span key={i} style={{ width: 7, height: 7, borderRadius: '50%', background: i === sceneIndex ? 'var(--terracotta)' : 'rgba(201,122,74,0.2)' }} />
              ))}
            </div>

            <button type="button" className="primary-btn" onClick={nextScene}>
              {isLastScene ? "Why learn Japanese? →" : 'Continue →'}
            </button>
          </motion.div>
        </AnimatePresence>
      ) : (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <div className="section-header" style={{ marginBottom: 16 }}>
            <span className="section-title">What Japanese Unlocks</span>
          </div>
          <div className="grid-3">
            {WHY_LEARN.map((item, i) => (
              <motion.div key={item.title} className="content-card"
                initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
                <div style={{ fontSize: '1.8rem', marginBottom: 8 }}>{item.icon}</div>
                <h3>{item.title}</h3>
                <p>{item.desc}</p>
              </motion.div>
            ))}
          </div>

          <motion.div className="clay-card" style={{ textAlign: 'center', marginTop: 24 }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 900, color: 'var(--dark-ink)', marginBottom: 8 }}>
              Your journey starts now
            </h2>
            <p style={{ color: 'var(--muted-plum)', fontSize: '0.88rem', marginBottom: 18 }}>
              Ten short chapters stand between you and your first real Japanese conversation. Let's begin.
            </p>
            <button type="button" className="primary-btn" onClick={finish}>Begin the Journey ✈️</button>
          </motion.div>
        </motion.div>
      )}

      <XPToast xp={CHAPTERS.welcome.xp} visible={showXpToast} />
      <AchievementUnlockModal open={!!unlockedBadge} badge={unlockedBadge} onClose={closeBadgeModal} />
    </div>
  )
}
