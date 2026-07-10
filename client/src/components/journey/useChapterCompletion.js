import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useJourney } from '../../contexts/JourneyContext'
import { CHAPTERS } from '../../pages/journey/content/chapters'

// Local display metadata for journey badges (icon/name/desc), mirroring the
// server's master achievement list in server/src/routes.ts — the client
// doesn't round-trip to the achievements API just to show an unlock modal.
const BADGE_INFO = {
  journey_welcome: { icon: '✈️', name: 'Welcome to Japan', desc: 'Began the Beginner Journey.' },
  journey_jlpt_map: { icon: '🗺️', name: 'Path Finder', desc: 'Learned what the JLPT levels mean.' },
  journey_hiragana: { icon: '🌸', name: 'First Japanese Character', desc: 'Learned your first 10 hiragana.' },
  journey_katakana: { icon: '🗾', name: 'Katakana Explorer', desc: 'Learned your first katakana.' },
  journey_kanji: { icon: '🖌', name: 'First Kanji Master', desc: 'Learned your first 5 kanji.' },
  journey_conversationalist: { icon: '💬', name: 'Conversationalist', desc: 'Completed every beginner dialogue scenario.' },
  journey_culture: { icon: '🎌', name: 'Culture Explorer', desc: 'Explored Japanese culture and customs.' },
  journey_graduate: { icon: '🎉', name: 'Beginner Journey Graduate', desc: 'Completed the entire Beginner Journey.' },
}

// Shared completion flow for every chapter: award XP/badges via the API,
// then either show a celebratory badge modal or a brief XP toast before
// advancing to `nextRoute`.
export function useChapterCompletion(chapterId, nextRoute) {
  const { completeChapter } = useJourney()
  const navigate = useNavigate()
  const [unlockedBadge, setUnlockedBadge] = useState(null)
  const [showXpToast, setShowXpToast] = useState(false)

  async function finish() {
    const result = await completeChapter(chapterId)
    const chapter = CHAPTERS[chapterId]
    const badgeId = result?.badgesAwarded?.[0]

    if (badgeId && BADGE_INFO[badgeId]) {
      setUnlockedBadge({ ...BADGE_INFO[badgeId], xp: chapter.xp })
      return
    }

    if (result?.xpGained > 0) {
      setShowXpToast(true)
      setTimeout(() => setShowXpToast(false), 1800)
    }
    navigate(nextRoute)
  }

  function closeBadgeModal() {
    setUnlockedBadge(null)
    navigate(nextRoute)
  }

  return { finish, unlockedBadge, closeBadgeModal, showXpToast }
}
