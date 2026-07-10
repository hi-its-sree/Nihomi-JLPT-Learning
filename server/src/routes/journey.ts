import { Hono } from 'hono'
import { db } from '../db'
import { requireAuth } from '../middleware/requireAuth'

const journey = new Hono()

journey.use('*', requireAuth)

// Server owns the reward table — never trust client-sent XP/badge amounts.
export const CHAPTER_REWARDS: Record<string, { xp: number; badgeIds: string[] }> = {
  'welcome':            { xp: 50,  badgeIds: ['journey_welcome'] },
  'jlpt-overview':      { xp: 40,  badgeIds: ['journey_jlpt_map'] },
  'writing-systems':    { xp: 40,  badgeIds: [] },
  'first-hiragana':     { xp: 75,  badgeIds: ['journey_hiragana'] },
  'first-katakana':     { xp: 75,  badgeIds: ['journey_katakana'] },
  'first-kanji':        { xp: 75,  badgeIds: ['journey_kanji'] },
  'study-effectively':  { xp: 40,  badgeIds: [] },
  'daily-conversation': { xp: 120, badgeIds: ['journey_conversationalist'] },
  'japanese-culture':   { xp: 60,  badgeIds: ['journey_culture'] },
  'complete':           { xp: 100, badgeIds: ['journey_graduate'] },
}

async function buildJourneyState(userId: string) {
  const [progressRows, badgeRows, user] = await Promise.all([
    db.journeyProgress.findMany({ where: { userId }, select: { chapterId: true, xpAwarded: true } }),
    db.userAchievement.findMany({
      where: { userId, achievementId: { startsWith: 'journey_' } },
      select: { achievementId: true },
    }),
    db.user.findUnique({ where: { id: userId }, select: { hasSkippedJourney: true } }),
  ])

  const completedChapters = progressRows.map((row) => row.chapterId)
  const xp = progressRows.reduce((sum, row) => sum + row.xpAwarded, 0)
  const badges = badgeRows.map((row) => row.achievementId)

  return {
    completedChapters,
    xp,
    badges,
    hasCompletedJourney: completedChapters.includes('complete'),
    hasSkippedJourney: user?.hasSkippedJourney ?? false,
  }
}

// GET /api/v1/journey/state
journey.get('/state', async (c) => {
  const userId = c.get('userId') as string
  const state = await buildJourneyState(userId)
  return c.json(state)
})

// POST /api/v1/journey/chapters/:chapterId/complete
journey.post('/chapters/:chapterId/complete', async (c) => {
  const userId = c.get('userId') as string
  const chapterId = c.req.param('chapterId')

  const reward = CHAPTER_REWARDS[chapterId]
  if (!reward) {
    return c.json({ error: `Unknown chapter "${chapterId}"` }, 400)
  }

  const existing = await db.journeyProgress.findUnique({
    where: { userId_chapterId: { userId, chapterId } },
  })

  if (existing) {
    const state = await buildJourneyState(userId)
    return c.json({
      chapterId,
      xpGained: 0,
      badgesAwarded: [],
      alreadyCompleted: true,
      totalJourneyXp: state.xp,
      hasCompletedJourney: state.hasCompletedJourney,
    })
  }

  await db.$transaction([
    db.journeyProgress.create({
      data: { userId, chapterId, xpAwarded: reward.xp },
    }),
    ...(reward.badgeIds.length
      ? [
          db.userAchievement.createMany({
            data: reward.badgeIds.map((achievementId) => ({ userId, achievementId })),
            skipDuplicates: true,
          }),
        ]
      : []),
    db.user.update({ where: { id: userId }, data: { xp: { increment: reward.xp } } }),
  ])

  const state = await buildJourneyState(userId)
  await import('../routes').then(({ default: routes }) => routes)
  return c.json({
    chapterId,
    xpGained: reward.xp,
    badgesAwarded: reward.badgeIds,
    alreadyCompleted: false,
    totalJourneyXp: state.xp,
    hasCompletedJourney: state.hasCompletedJourney,
  })
})

// POST /api/v1/journey/skip
journey.post('/skip', async (c) => {
  const userId = c.get('userId') as string
  await db.user.update({ where: { id: userId }, data: { hasSkippedJourney: true } })
  return c.json({ hasSkippedJourney: true })
})

export default journey
