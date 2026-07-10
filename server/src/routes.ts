import { Hono } from 'hono'
import type { Prisma } from '@prisma/client'
import { db } from './db'
import { requireAuth } from './middleware/requireAuth'
import authRoutes from './routes/auth'
import kanjiRoutes from './routes/kanji'
import journeyRoutes from './routes/journey'

const router = new Hono()

const LEVEL_ORDER = ['N5', 'N4', 'N3', 'N2', 'N1'] as const
const LEVEL_META: Record<(typeof LEVEL_ORDER)[number], { title: string; jp: string; focus: string; color: string; emoji: string }> = {
  N5: { title: 'Beginner', jp: '初級', focus: 'Hiragana, katakana, daily greetings, and simple sentence patterns.', color: '#059669', emoji: '🌱' },
  N4: { title: 'Elementary', jp: '基礎', focus: 'Everyday conversation, practical grammar, and short reading.', color: '#0284c7', emoji: '🌿' },
  N3: { title: 'Intermediate', jp: '中級', focus: 'Broader vocabulary, listening comprehension, and nuanced reading.', color: '#7c3aed', emoji: '🌸' },
  N2: { title: 'Upper Intermediate', jp: '上中級', focus: 'Longer passages, business contexts, and natural speech patterns.', color: '#b45309', emoji: '🎋' },
  N1: { title: 'Advanced', jp: '上級', focus: 'Literary, academic, and complex real-world Japanese.', color: '#be123c', emoji: '⛩' },
}

function normalizeLevelCode(value?: string | null) {
  const upper = value?.toUpperCase()
  return LEVEL_ORDER.includes(upper as (typeof LEVEL_ORDER)[number]) ? upper as (typeof LEVEL_ORDER)[number] : 'N5'
}

async function buildLevelCatalog(userId?: string) {
  const [user, vocabularyCounts, kanjiCounts, grammarCounts, progressEntries] = await Promise.all([
    userId ? db.user.findUnique({ where: { id: userId }, select: { studyLevel: true } }) : Promise.resolve(null),
    db.vocabulary.groupBy({ by: ['level'], _count: { id: true } }),
    db.kanjiEntry.groupBy({ by: ['level'], _count: { id: true } }),
    db.grammarPattern.groupBy({ by: ['level'], _count: { id: true } }),
    userId ? db.userProgress.findMany({ where: { userId }, select: { level: true, mastery: true } }) : Promise.resolve([]),
  ])

  const vocabMap = Object.fromEntries(vocabularyCounts.map((entry) => [normalizeLevelCode(entry.level), entry._count.id]))
  const kanjiMap = Object.fromEntries(kanjiCounts.map((entry) => [normalizeLevelCode(entry.level), entry._count.id]))
  const grammarMap = Object.fromEntries(grammarCounts.map((entry) => [normalizeLevelCode(entry.level), entry._count.id]))

  const progressByLevel = new Map<string, number[]>()
  progressEntries.forEach((entry) => {
    const level = normalizeLevelCode(entry.level)
    const bucket = progressByLevel.get(level) ?? []
    bucket.push(entry.mastery)
    progressByLevel.set(level, bucket)
  })

  const currentLevel = normalizeLevelCode(user?.studyLevel)
  const currentIndex = LEVEL_ORDER.indexOf(currentLevel)

  return LEVEL_ORDER.map((level, index) => {
    const meta = LEVEL_META[level]
    const vocabCount = vocabMap[level] ?? 0
    const kanjiCount = kanjiMap[level] ?? 0
    const grammarCount = grammarMap[level] ?? 0
    const averageProgress = progressByLevel.get(level)?.length
      ? Math.round(progressByLevel.get(level)!.reduce((sum, value) => sum + value, 0) / progressByLevel.get(level)!.length)
      : 0

    let progress = 0
    if (index < currentIndex) progress = 100
    else if (index === currentIndex) progress = Math.max(0, Math.min(100, averageProgress))

    const status: 'complete' | 'current' | 'upcoming' =
      index < currentIndex ? 'complete' : index === currentIndex ? 'current' : 'upcoming'

    return {
      code: level,
      title: meta.title,
      jp: meta.jp,
      focus: meta.focus,
      color: meta.color,
      colorBg: `${meta.color}14`,
      colorBorder: `${meta.color}33`,
      badge: `badge-${level.toLowerCase()}`,
      emoji: meta.emoji,
      stats: { kanji: kanjiCount, vocab: vocabCount, grammar: grammarCount },
      progress,
      status,
      current: index === currentIndex,
    }
  })
}

// Real, level-appropriate content totals — cumulative counts of kanji/vocab/grammar
// from N5 up through targetLevel, computed from actual DB content rather than
// hardcoded numbers (which drift out of sync with the real content and don't
// vary by level, e.g. showing an N5 learner's kanji mastery against the N3 total).
async function getCumulativeContentTotals(targetLevel: (typeof LEVEL_ORDER)[number]) {
  const [vocabularyCounts, kanjiCounts, grammarCounts] = await Promise.all([
    db.vocabulary.groupBy({ by: ['level'], _count: { id: true } }),
    db.kanjiEntry.groupBy({ by: ['level'], _count: { id: true } }),
    db.grammarPattern.groupBy({ by: ['level'], _count: { id: true } }),
  ])

  const vocabMap = Object.fromEntries(vocabularyCounts.map((entry) => [normalizeLevelCode(entry.level), entry._count.id]))
  const kanjiMap = Object.fromEntries(kanjiCounts.map((entry) => [normalizeLevelCode(entry.level), entry._count.id]))
  const grammarMap = Object.fromEntries(grammarCounts.map((entry) => [normalizeLevelCode(entry.level), entry._count.id]))

  const levelsUpToTarget = LEVEL_ORDER.slice(0, LEVEL_ORDER.indexOf(targetLevel) + 1)
  const sum = (map: Record<string, number>) => levelsUpToTarget.reduce((total, level) => total + (map[level] ?? 0), 0)

  return { kanji: sum(kanjiMap), vocabulary: sum(vocabMap), grammar: sum(grammarMap) }
}

type AchievementContext = {
  lessonCount: number
  streakDays: number
  xp: number
  reviewCount: number
  uniqueKanjiCount: number
  uniqueVocabularyCount: number
  studyLevel: string
  completedChapterIds: Set<string>
  earnedAchievementIds: Set<string>
}

type AchievementDefinition = {
  id: string
  title: string
  desc: string
  icon: string
  rarity: string
  xp: number
  evaluate: (context: AchievementContext) => { earned: boolean; progress: number; current: number; goal: number }
}

const ACHIEVEMENT_DEFINITIONS: AchievementDefinition[] = [
  {
    id: 'first_lesson',
    title: 'First Step',
    desc: 'Complete your first lesson.',
    icon: '🌱',
    rarity: 'Common',
    xp: 50,
    evaluate: ({ lessonCount }) => ({ earned: lessonCount > 0, progress: Math.min(100, (lessonCount / 1) * 100), current: lessonCount, goal: 1 }),
  },
  {
    id: 'streak_7',
    title: 'Week Warrior',
    desc: 'Maintain a 7-day study streak.',
    icon: '🔥',
    rarity: 'Uncommon',
    xp: 100,
    evaluate: ({ streakDays }) => ({ earned: streakDays >= 7, progress: Math.min(100, (streakDays / 7) * 100), current: streakDays, goal: 7 }),
  },
  {
    id: 'streak_30',
    title: 'Monthly Master',
    desc: 'Maintain a 30-day study streak.',
    icon: '🗓',
    rarity: 'Rare',
    xp: 300,
    evaluate: ({ streakDays }) => ({ earned: streakDays >= 30, progress: Math.min(100, (streakDays / 30) * 100), current: streakDays, goal: 30 }),
  },
  {
    id: 'card_collector',
    title: 'Card Collector',
    desc: 'Review 100 flashcards.',
    icon: '🃏',
    rarity: 'Common',
    xp: 75,
    evaluate: ({ reviewCount }) => ({ earned: reviewCount >= 100, progress: Math.min(100, (reviewCount / 100) * 100), current: reviewCount, goal: 100 }),
  },
  {
    id: 'kanji_50',
    title: 'Kanji Collector',
    desc: 'Study 50 unique kanji.',
    icon: '字',
    rarity: 'Common',
    xp: 75,
    evaluate: ({ uniqueKanjiCount }) => ({ earned: uniqueKanjiCount >= 50, progress: Math.min(100, (uniqueKanjiCount / 50) * 100), current: uniqueKanjiCount, goal: 50 }),
  },
  {
    id: 'kanji_200',
    title: 'Kanji Scholar',
    desc: 'Study 200 unique kanji.',
    icon: '🏛',
    rarity: 'Epic',
    xp: 500,
    evaluate: ({ uniqueKanjiCount }) => ({ earned: uniqueKanjiCount >= 200, progress: Math.min(100, (uniqueKanjiCount / 200) * 100), current: uniqueKanjiCount, goal: 200 }),
  },
  {
    id: 'journey_welcome',
    title: 'Welcome to Japan',
    desc: 'Began the Beginner Journey.',
    icon: '✈️',
    rarity: 'Common',
    xp: 50,
    evaluate: ({ completedChapterIds }) => ({ earned: completedChapterIds.has('welcome'), progress: completedChapterIds.has('welcome') ? 100 : 0, current: completedChapterIds.has('welcome') ? 1 : 0, goal: 1 }),
  },
  {
    id: 'journey_jlpt_map',
    title: 'Path Finder',
    desc: 'Learned what the JLPT levels mean.',
    icon: '🗺️',
    rarity: 'Common',
    xp: 40,
    evaluate: ({ completedChapterIds }) => ({ earned: completedChapterIds.has('jlpt-overview'), progress: completedChapterIds.has('jlpt-overview') ? 100 : 0, current: completedChapterIds.has('jlpt-overview') ? 1 : 0, goal: 1 }),
  },
  {
    id: 'journey_hiragana',
    title: 'First Japanese Character',
    desc: 'Learned your first 10 hiragana.',
    icon: '🌸',
    rarity: 'Uncommon',
    xp: 75,
    evaluate: ({ completedChapterIds }) => ({ earned: completedChapterIds.has('first-hiragana'), progress: completedChapterIds.has('first-hiragana') ? 100 : 0, current: completedChapterIds.has('first-hiragana') ? 1 : 0, goal: 1 }),
  },
  {
    id: 'journey_katakana',
    title: 'Katakana Explorer',
    desc: 'Learned your first katakana.',
    icon: '🗾',
    rarity: 'Uncommon',
    xp: 75,
    evaluate: ({ completedChapterIds }) => ({ earned: completedChapterIds.has('first-katakana'), progress: completedChapterIds.has('first-katakana') ? 100 : 0, current: completedChapterIds.has('first-katakana') ? 1 : 0, goal: 1 }),
  },
  {
    id: 'journey_kanji',
    title: 'First Kanji Master',
    desc: 'Learned your first 5 kanji.',
    icon: '🖌',
    rarity: 'Uncommon',
    xp: 75,
    evaluate: ({ completedChapterIds }) => ({ earned: completedChapterIds.has('first-kanji'), progress: completedChapterIds.has('first-kanji') ? 100 : 0, current: completedChapterIds.has('first-kanji') ? 1 : 0, goal: 1 }),
  },
  {
    id: 'journey_conversationalist',
    title: 'Conversationalist',
    desc: 'Completed every beginner dialogue scenario.',
    icon: '💬',
    rarity: 'Rare',
    xp: 120,
    evaluate: ({ completedChapterIds }) => ({ earned: completedChapterIds.has('daily-conversation'), progress: completedChapterIds.has('daily-conversation') ? 100 : 0, current: completedChapterIds.has('daily-conversation') ? 1 : 0, goal: 1 }),
  },
  {
    id: 'journey_culture',
    title: 'Culture Explorer',
    desc: 'Explored Japanese culture and customs.',
    icon: '🎌',
    rarity: 'Uncommon',
    xp: 60,
    evaluate: ({ completedChapterIds }) => ({ earned: completedChapterIds.has('japanese-culture'), progress: completedChapterIds.has('japanese-culture') ? 100 : 0, current: completedChapterIds.has('japanese-culture') ? 1 : 0, goal: 1 }),
  },
  {
    id: 'journey_graduate',
    title: 'Beginner Journey Graduate',
    desc: 'Completed the entire Beginner Journey.',
    icon: '🎉',
    rarity: 'Rare',
    xp: 100,
    evaluate: ({ completedChapterIds }) => ({ earned: completedChapterIds.has('complete'), progress: completedChapterIds.has('complete') ? 100 : 0, current: completedChapterIds.has('complete') ? 1 : 0, goal: 1 }),
  },
  {
    id: 'test_pass_n5',
    title: 'N5 Certified',
    desc: 'Score 90%+ on an N5 mock test.',
    icon: '📋',
    rarity: 'Uncommon',
    xp: 150,
    evaluate: () => ({ earned: false, progress: 0, current: 0, goal: 1 }),
  },
  {
    id: 'n5_complete',
    title: 'N5 Graduate',
    desc: 'Complete all N5 lessons.',
    icon: '🎓',
    rarity: 'Rare',
    xp: 200,
    evaluate: ({ lessonCount, studyLevel }) => ({ earned: lessonCount > 0 && ['N4', 'N3', 'N2', 'N1'].includes(studyLevel), progress: Math.min(100, (lessonCount / 8) * 100), current: lessonCount, goal: 8 }),
  },
  {
    id: 'n1_complete',
    title: 'Fluency Achieved',
    desc: 'Complete all N1 lessons.',
    icon: '🏆',
    rarity: 'Legendary',
    xp: 2000,
    evaluate: ({ studyLevel }) => ({ earned: studyLevel === 'N1', progress: studyLevel === 'N1' ? 100 : 0, current: studyLevel === 'N1' ? 1 : 0, goal: 1 }),
  },
]

async function getAchievementContext(userId: string) {
  const [user, earnedRows, lessonHistory, flashcardRows, journeyProgressRows] = await Promise.all([
    db.user.findUnique({
      where: { id: userId },
      select: { studyLevel: true, xp: true, streakDays: true },
    }),
    db.userAchievement.findMany({ where: { userId }, select: { achievementId: true, earnedAt: true } }),
    db.lessonHistory.findMany({ where: { userId }, select: { id: true } }),
    db.flashcardReview.findMany({ where: { userId }, select: { reviewCount: true, kanjiId: true, vocabularyId: true } }),
    db.journeyProgress.findMany({ where: { userId }, select: { chapterId: true } }),
  ])

  const reviewCount = flashcardRows.reduce((sum, row) => sum + (row.reviewCount ?? 0), 0)
  const uniqueKanjiCount = new Set(flashcardRows.filter((row) => row.kanjiId).map((row) => row.kanjiId)).size
  const uniqueVocabularyCount = new Set(flashcardRows.filter((row) => row.vocabularyId).map((row) => row.vocabularyId)).size

  return {
    user,
    earnedRows,
    lessonCount: lessonHistory.length,
    streakDays: user?.streakDays ?? 0,
    xp: user?.xp ?? 0,
    reviewCount,
    uniqueKanjiCount,
    uniqueVocabularyCount,
    studyLevel: user?.studyLevel ?? 'N5',
    completedChapterIds: new Set(journeyProgressRows.map((row) => row.chapterId)),
  }
}

async function buildAchievementPayload(userId: string) {
  const context = await getAchievementContext(userId)
  const earnedById = new Map(context.earnedRows.map((row) => [row.achievementId, row.earnedAt]))
  const earnedAchievementIds = new Set(context.earnedRows.map((row) => row.achievementId))
  const newlyUnlocked: string[] = []

  for (const definition of ACHIEVEMENT_DEFINITIONS) {
    const state = definition.evaluate({
      lessonCount: context.lessonCount,
      streakDays: context.streakDays,
      xp: context.xp,
      reviewCount: context.reviewCount,
      uniqueKanjiCount: context.uniqueKanjiCount,
      uniqueVocabularyCount: context.uniqueVocabularyCount,
      studyLevel: context.studyLevel,
      completedChapterIds: context.completedChapterIds,
      earnedAchievementIds,
    })

    if (state.earned && !earnedAchievementIds.has(definition.id)) {
      newlyUnlocked.push(definition.id)
    }
  }

  if (newlyUnlocked.length) {
    const xpAward = newlyUnlocked.reduce((sum, achievementId) => {
      const definition = ACHIEVEMENT_DEFINITIONS.find((entry) => entry.id === achievementId)
      return sum + (definition?.xp ?? 0)
    }, 0)

    await db.userAchievement.createMany({
      data: newlyUnlocked.map((achievementId) => ({ userId, achievementId })),
      skipDuplicates: true,
    })

    if (xpAward > 0) {
      await db.user.update({ where: { id: userId }, data: { xp: { increment: xpAward } } })
    }
  }

  const refreshedRows = await db.userAchievement.findMany({ where: { userId }, select: { achievementId: true, earnedAt: true } })
  const refreshedMap = new Map(refreshedRows.map((row) => [row.achievementId, row.earnedAt]))
  const refreshedIds = new Set(refreshedRows.map((row) => row.achievementId))

  return ACHIEVEMENT_DEFINITIONS.map((definition) => {
    const state = definition.evaluate({
      lessonCount: context.lessonCount,
      streakDays: context.streakDays,
      xp: context.xp,
      reviewCount: context.reviewCount,
      uniqueKanjiCount: context.uniqueKanjiCount,
      uniqueVocabularyCount: context.uniqueVocabularyCount,
      studyLevel: context.studyLevel,
      completedChapterIds: context.completedChapterIds,
      earnedAchievementIds: refreshedIds,
    })

    const earned = refreshedIds.has(definition.id) || state.earned
    return {
      id: definition.id,
      title: definition.title,
      desc: definition.desc,
      icon: definition.icon,
      rarity: definition.rarity,
      xp: definition.xp,
      earned,
      date: earned ? refreshedMap.get(definition.id)?.toISOString() ?? null : null,
      progress: state.progress,
      goal: state.goal,
      current: state.current,
    }
  })
}

// ── Auth ─────────────────────────────────────────────────────────────────────

router.route('/auth', authRoutes)
router.route('/api/kanji', kanjiRoutes)
router.route('/api/v1/kanji', kanjiRoutes)
router.route('/api/v1/journey', journeyRoutes)

// ── Health ───────────────────────────────────────────────────────────────────

router.get('/health', (c) => {
  return c.json({ status: 'ok', service: 'jlpt-learning-api' })
})

// ── Dashboard (real DB) ──────────────────────────────────────────────────────

router.get('/api/v1/dashboard', requireAuth, async (c) => {
  const userId = c.get('userId') as string
  const user = await db.user.findUnique({
    where: { id: userId },
    select: {
      username: true,
      xp: true,
      streakDays: true,
      studyLevel: true,
      lastStudied: true,
      _count: { select: { lessonHistory: true } },
      progress: { select: { category: true, mastery: true } },
    },
  })
  if (!user) return c.json({ error: 'User not found' }, 404)

  const progressMap = Object.fromEntries(
    user.progress.map((entry) => [entry.category.toLowerCase(), entry.mastery]),
  )

  const levelOrder = ['N5', 'N4', 'N3', 'N2', 'N1'] as const
  const targetLevel = user.studyLevel && levelOrder.includes(user.studyLevel as (typeof levelOrder)[number])
    ? user.studyLevel as (typeof levelOrder)[number]
    : 'N5'
  const targetIndex = levelOrder.indexOf(targetLevel)

  const targetMeta: Record<string, { focus: string; weeklyGoal: number; baseMastery: { kanji: number; vocabulary: number; grammar: number } }> = {
    N5: { focus: 'Build the basics: hiragana, katakana, simple grammar, and everyday vocabulary.', weeklyGoal: 300, baseMastery: { kanji: 10, vocabulary: 8, grammar: 7 } },
    N4: { focus: 'Strengthen everyday communication and more practical sentence patterns.', weeklyGoal: 400, baseMastery: { kanji: 16, vocabulary: 14, grammar: 12 } },
    N3: { focus: 'Improve reading, listening, and intermediate grammar for everyday and media contexts.', weeklyGoal: 500, baseMastery: { kanji: 22, vocabulary: 20, grammar: 18 } },
    N2: { focus: 'Handle longer passages, richer vocabulary, and natural speech patterns.', weeklyGoal: 600, baseMastery: { kanji: 30, vocabulary: 28, grammar: 24 } },
    N1: { focus: 'Aim for near-native fluency, nuanced reading, and advanced listening.', weeklyGoal: 700, baseMastery: { kanji: 38, vocabulary: 34, grammar: 30 } },
  }

  const target = targetMeta[targetLevel] ?? targetMeta.N5
  const contentTotals = await getCumulativeContentTotals(targetLevel)

  // Mastery must only move in response to real learning activity (completed lessons,
  // recorded per-category progress) — never from XP alone, since XP also accrues from
  // non-learning sources like the Beginner Journey onboarding rewards.
  const boostFromActivity = Math.min(20, user._count.lessonHistory * 2 + user.streakDays)
  const masterySeed = {
    kanji: Math.min(95, target.baseMastery.kanji + boostFromActivity + (progressMap.kanji ?? 0) * 0.2),
    vocabulary: Math.min(95, target.baseMastery.vocabulary + boostFromActivity + (progressMap.vocabulary ?? 0) * 0.2),
    grammar: Math.min(95, target.baseMastery.grammar + boostFromActivity + (progressMap.grammar ?? 0) * 0.2),
  }

  // A user hasn't "started learning" until they have a completed lesson or recorded
  // progress — XP and streak alone (which the Beginner Journey can raise on its own)
  // don't count, so mastery stays at a clean 0 until real study begins.
  const hasStartedLearning = user._count.lessonHistory > 0 || Object.values(progressMap).some((v) => v)
  if (!hasStartedLearning) {
    masterySeed.kanji = 0
    masterySeed.vocabulary = 0
    masterySeed.grammar = 0
  }
  const isNewUser = !hasStartedLearning

  const toRelativeTime = (value: Date | string) => {
    const diffMinutes = Math.max(1, Math.round((Date.now() - new Date(value).getTime()) / 60000))
    if (diffMinutes < 60) return `${diffMinutes}m ago`
    const diffHours = Math.round(diffMinutes / 60)
    if (diffHours < 24) return `${diffHours}h ago`
    const diffDays = Math.round(diffHours / 24)
    return `${diffDays}d ago`
  }

  const recentLessons = await db.lessonHistory.findMany({
    where: { userId },
    orderBy: { completedAt: 'desc' },
    take: 3,
    select: { lessonId: true, xpGained: true, completedAt: true },
  })

  const mastery = [
    { label: 'Kanji', done: Math.round(contentTotals.kanji * (masterySeed.kanji / 100)), total: contentTotals.kanji, pct: Math.round(masterySeed.kanji), color: '#c97a4a' },
    { label: 'Vocabulary', done: Math.round(contentTotals.vocabulary * (masterySeed.vocabulary / 100)), total: contentTotals.vocabulary, pct: Math.round(masterySeed.vocabulary), color: '#8b6f8b' },
    { label: 'Grammar', done: Math.round(contentTotals.grammar * (masterySeed.grammar / 100)), total: contentTotals.grammar, pct: Math.round(masterySeed.grammar), color: '#7d8d6a' },
  ]

  // Same rule as mastery: readiness reflects real study (lessons, streak, recorded
  // progress), never raw XP — otherwise Beginner Journey rewards would move it too.
  const readiness = hasStartedLearning
    ? Math.min(100, Math.round((user.streakDays * 4) + (user._count.lessonHistory * 2) + (targetIndex * 6)))
    : 0

  return c.json({
    message: `Welcome back, ${user.username}!`,
    stats: {
      streak: user.streakDays,
      xp: user.xp,
      readiness,
      lessonsCompleted: user._count.lessonHistory,
    },
    isNewUser,
    target: {
      level: targetLevel,
      title: `JLPT ${targetLevel} target`,
      focus: target.focus,
      weeklyGoal: target.weeklyGoal + Math.min(150, user.streakDays * 20),
      description: user._count.lessonHistory > 0
        ? `You are building toward ${targetLevel} with ${user._count.lessonHistory} completed lessons.`
        : `You are starting fresh toward ${targetLevel}.`,
    },
    todayPlan: isNewUser ? [
      { id: 'welcome', title: `Welcome — start your first ${targetLevel} lesson`, icon: '🌱', duration: '10 min', xp: 15, done: false, cta: '/lessons' },
    ] : [
      { id: 1, title: `${targetLevel} Vocabulary Review`, icon: '🃏', duration: '15 min', xp: 40 + (user.streakDays % 5) * 2, done: false },
      { id: 2, title: `${targetLevel} Kanji Drill`, icon: '字', duration: '10 min', xp: 30 + (user._count.lessonHistory % 3) * 3, done: user._count.lessonHistory > 0 },
      { id: 3, title: `${targetLevel} Grammar Focus`, icon: '文', duration: '12 min', xp: 35 + (targetIndex >= 0 ? targetIndex : 0) * 2, done: false },
      { id: 4, title: 'Listening Practice', icon: '👂', duration: '20 min', xp: 50, done: false },
    ],
    mastery,
    recentActivity: recentLessons.map((lesson) => ({
      label: `Completed lesson ${lesson.lessonId}`,
      time: toRelativeTime(lesson.completedAt),
      xp: lesson.xpGained,
    })),
  })
})

// ── Roadmap (real DB — per-level status/progress/content counts + real total XP)
router.get('/api/v1/roadmap', requireAuth, async (c) => {
  const userId = c.get('userId') as string
  const [levels, user] = await Promise.all([
    buildLevelCatalog(userId),
    db.user.findUnique({ where: { id: userId }, select: { xp: true } }),
  ])
  return c.json({ levels, totalXp: user?.xp ?? 0 })
})

// ── Levels ───────────────────────────────────────────────────────────────────

router.get('/api/v1/levels', requireAuth, async (c) => {
  const userId = c.get('userId') as string
  const levels = await buildLevelCatalog(userId)
  return c.json({ levels })
})

router.get('/api/v1/levels/:levelId', requireAuth, async (c) => {
  const userId = c.get('userId') as string
  const level = normalizeLevelCode(c.req.param('levelId'))
  const levels = await buildLevelCatalog(userId)
  const detail = levels.find((entry) => entry.code === level)
  if (!detail) return c.json({ error: 'Level not found' }, 404)

  return c.json({
    ...detail,
    outcomes: [
      'Practice vocabulary from the database',
      'Review kanji entries from the database',
      'Explore grammar patterns from the database',
      'Track progress for this level',
    ],
    topics: [
      `Database vocabulary entries: ${detail.stats.vocab}`,
      `Database kanji entries: ${detail.stats.kanji}`,
      `Database grammar patterns: ${detail.stats.grammar}`,
      `Current progress: ${detail.progress}%`,
    ],
  })
})

// ── Vocabulary ────────────────────────────────────────────────────────────────

router.get('/api/v1/vocabulary', requireAuth, async (c) => {
  const level = c.req.query('level')
  const stage = c.req.query('stage')
  const search = c.req.query('search')

  const normalizedLevel = level && ['N5', 'N4', 'N3', 'N2', 'N1'].includes(level.toUpperCase()) ? level.toUpperCase() : undefined
  const normalizedStage = stage && ['new', 'review', 'known'].includes(stage.toLowerCase()) ? stage.toLowerCase() : undefined

  const where: Prisma.VocabularyWhereInput = {}
  if (normalizedLevel) where.level = normalizedLevel
  if (normalizedStage) where.category = normalizedStage
  if (search) {
    where.OR = [
      { word: { contains: search, mode: 'insensitive' } },
      { reading: { contains: search, mode: 'insensitive' } },
      { meaning: { contains: search, mode: 'insensitive' } },
      { example: { contains: search, mode: 'insensitive' } },
    ]
  }

  const rows = await db.vocabulary.findMany({
    where,
    orderBy: { word: 'asc' },
    select: {
      id: true,
      word: true,
      reading: true,
      meaning: true,
      level: true,
      category: true,
      example: true,
      exampleTl: true,
    },
  })

  const vocab = rows.map((entry) => ({
    id: entry.id,
    word: entry.word,
    reading: entry.reading,
    meaning: entry.meaning,
    level: entry.level?.toUpperCase() ?? 'N5',
    stage: (entry.category ?? 'new').toLowerCase(),
    example: entry.example ?? entry.exampleTl ?? '',
    exTl: entry.exampleTl ?? '',
    pos: 'word',
  }))

  return c.json({ vocab, total: vocab.length })
})

// ── Grammar ───────────────────────────────────────────────────────────────────

router.get('/api/v1/grammar', requireAuth, async (c) => {
  const level = c.req.query('level')
  const search = c.req.query('search')

  const normalizedLevel = level && ['N5', 'N4', 'N3', 'N2', 'N1'].includes(level.toUpperCase()) ? level.toUpperCase() : undefined

  const where: Prisma.GrammarPatternWhereInput = {}
  if (normalizedLevel) where.level = normalizedLevel
  if (search) {
    where.OR = [
      { pattern:   { contains: search, mode: 'insensitive' } },
      { meaning:   { contains: search, mode: 'insensitive' } },
      { structure: { contains: search, mode: 'insensitive' } },
    ]
  }

  const rows = await db.grammarPattern.findMany({
    where,
    orderBy: [{ level: 'asc' }, { pattern: 'asc' }],
    take: 300,
    select: {
      id: true,
      pattern: true,
      meaning: true,
      structure: true,
      level: true,
      examples: true,
      note: true,
    },
  })

  const grammar = rows.map((entry) => {
    const examples = Array.isArray(entry.examples) ? entry.examples : []
    const firstExample = examples.length > 0 ? examples[0] : null

    const exampleText = (() => {
      if (typeof firstExample === 'string') return firstExample
      if (typeof firstExample === 'object' && firstExample !== null) {
        const exampleObj = firstExample as Record<string, any>
        return String(exampleObj.japanese ?? exampleObj.text ?? exampleObj.sentence ?? exampleObj.example ?? '')
      }
      return ''
    })()

    const exampleTranslation = (() => {
      if (typeof firstExample === 'object' && firstExample !== null) {
        const exampleObj = firstExample as Record<string, any>
        return String(exampleObj.english ?? exampleObj.translation ?? exampleObj.exTl ?? '')
      }
      return ''
    })()

    const conjugations = examples.slice(1).map((example) => {
      if (typeof example === 'string') return example
      if (typeof example === 'object' && example !== null) {
        const exampleObj = example as Record<string, any>
        if ('japanese' in exampleObj || 'english' in exampleObj) {
          return `${String(exampleObj.japanese ?? exampleObj.text ?? exampleObj.sentence ?? '')}${exampleObj.english ? ` (${String(exampleObj.english)})` : ''}`
        }
        if ('text' in exampleObj) {
          return `${String(exampleObj.text)}${exampleObj.translation ? ` (${String(exampleObj.translation)})` : ''}`
        }
        if ('pattern' in exampleObj) {
          return String(exampleObj.pattern)
        }
        return JSON.stringify(exampleObj)
      }
      return String(example)
    })

    return {
      id: entry.id,
      pattern: entry.pattern,
      meaning: entry.meaning,
      structure: entry.structure,
      level: entry.level?.toUpperCase() ?? 'N5',
      example: exampleText,
      translation: exampleTranslation,
      note: entry.note ?? '',
      conjugations,
    }
  })

  return c.json({ grammar, total: grammar.length })
})

// ── Flashcards / SRS ──────────────────────────────────────────────────────────

const FLASHCARD_BATCH_SIZE = 12
const FLASHCARD_LEVELS = ['N5', 'N4', 'N3', 'N2', 'N1'] as const

function vocabToCard(v: { id: string; word: string; reading: string; meaning: string; level: string; example: string | null }) {
  return {
    // A slice of seed data has an empty `reading` (usually because the word is
    // already pure kana) — fall back to the word itself rather than show a blank line.
    id: `vocab:${v.id}`, cardType: 'vocabulary', front: v.word, frontReading: v.reading || v.word,
    back: v.meaning, example: v.example ?? '', level: v.level?.toUpperCase() ?? 'N5',
    isNew: true, reviewCount: 0,
  }
}

function kanjiToCard(k: { id: string; character: string; kunReadings: string[]; onReadings: string[]; meaning: string; level: string }) {
  return {
    id: `kanji:${k.id}`, cardType: 'kanji', front: k.character,
    frontReading: [...k.kunReadings, ...k.onReadings].join('、'),
    back: k.meaning, example: '', level: k.level?.toUpperCase() ?? 'N5',
    isNew: true, reviewCount: 0,
  }
}

// GET /api/v1/flashcards — real due-card queue: cards the user has reviewed before
// that are due again, topped up with fresh cards from the vocabulary/kanji banks at
// their level. Nothing here is hardcoded or mocked.
router.get('/api/v1/flashcards', requireAuth, async (c) => {
  const userId = c.get('userId') as string
  const now = new Date()

  const [user, dueReviews, allUserReviews] = await Promise.all([
    db.user.findUnique({ where: { id: userId }, select: { studyLevel: true } }),
    db.flashcardReview.findMany({
      where: { userId, nextReview: { lte: now } },
      include: { vocabulary: true, kanji: true },
      orderBy: { nextReview: 'asc' },
      take: FLASHCARD_BATCH_SIZE,
    }),
    db.flashcardReview.findMany({ where: { userId }, select: { vocabularyId: true, kanjiId: true } }),
  ])

  const queryLevel = c.req.query('level')?.toUpperCase()
  const level = FLASHCARD_LEVELS.includes(queryLevel as (typeof FLASHCARD_LEVELS)[number])
    ? queryLevel!
    : (user?.studyLevel ?? 'N5')

  const seenVocabIds = allUserReviews.map((r) => r.vocabularyId).filter((id): id is string => Boolean(id))
  const seenKanjiIds = allUserReviews.map((r) => r.kanjiId).filter((id): id is string => Boolean(id))

  const dueCards = dueReviews
    .filter((r) => r.vocabulary || r.kanji)
    .map((r) => {
      const card = r.vocabulary ? vocabToCard(r.vocabulary) : kanjiToCard(r.kanji!)
      return { ...card, isNew: false, reviewCount: r.reviewCount }
    })

  const remainingSlots = Math.max(0, FLASHCARD_BATCH_SIZE - dueCards.length)
  const vocabSlots = Math.ceil(remainingSlots * 0.7)
  const kanjiSlots = remainingSlots - vocabSlots

  const [newVocab, newKanji, totalDue] = await Promise.all([
    remainingSlots > 0
      ? db.vocabulary.findMany({ where: { level, id: { notIn: seenVocabIds } }, take: vocabSlots })
      : Promise.resolve([]),
    remainingSlots > 0
      ? db.kanjiEntry.findMany({ where: { level, id: { notIn: seenKanjiIds } }, take: kanjiSlots })
      : Promise.resolve([]),
    db.flashcardReview.count({ where: { userId, nextReview: { lte: now } } }),
  ])

  const newCards = [...newVocab.map(vocabToCard), ...newKanji.map(kanjiToCard)]

  return c.json({ deck: [...dueCards, ...newCards], due: totalDue, newCount: newCards.length, level })
})

// POST /api/v1/flashcards/:id/review — persists a real SM-2-style spaced-repetition
// update to FlashcardReview, keyed by the card id (`vocab:<id>` or `kanji:<id>`).
router.post('/api/v1/flashcards/:id/review', requireAuth, async (c) => {
  const userId = c.get('userId') as string
  const cardId = c.req.param('id') ?? ''
  const [cardType, contentId] = cardId.split(':')

  if (!contentId || (cardType !== 'vocab' && cardType !== 'kanji')) {
    return c.json({ error: 'Invalid card id' }, 400)
  }

  let body: { rating?: string }
  try {
    body = await c.req.json()
  } catch {
    return c.json({ error: 'Invalid JSON body' }, 400)
  }
  const rating = body.rating
  if (!rating || !['again', 'hard', 'good', 'easy'].includes(rating)) {
    return c.json({ error: 'rating must be one of again, hard, good, easy' }, 400)
  }

  const isVocab = cardType === 'vocab'
  const existing = await db.flashcardReview.findUnique({
    where: isVocab
      ? { userId_vocabularyId: { userId, vocabularyId: contentId } }
      : { userId_kanjiId: { userId, kanjiId: contentId } },
  })

  const prevInterval = existing?.interval ?? 1
  const prevEase = existing?.easeFactor ?? 2.5

  let interval: number
  let easeFactor = prevEase
  if (rating === 'again') {
    interval = 1
    easeFactor = Math.max(1.3, prevEase - 0.2)
  } else if (rating === 'hard') {
    interval = Math.max(1, Math.round(prevInterval * 1.2))
    easeFactor = Math.max(1.3, prevEase - 0.15)
  } else if (rating === 'good') {
    interval = Math.max(1, Math.round(prevInterval * prevEase))
  } else {
    interval = Math.max(1, Math.round(prevInterval * prevEase * 1.3))
    easeFactor = prevEase + 0.15
  }

  const nextReview = new Date()
  nextReview.setDate(nextReview.getDate() + interval)

  const baseData = {
    cardType: isVocab ? 'vocabulary' : 'kanji',
    interval,
    easeFactor,
    nextReview,
    lastRating: rating,
    reviewCount: { increment: 1 },
    ...(rating === 'again' ? { lapses: { increment: 1 } } : {}),
  }

  await db.flashcardReview.upsert({
    where: isVocab
      ? { userId_vocabularyId: { userId, vocabularyId: contentId } }
      : { userId_kanjiId: { userId, kanjiId: contentId } },
    create: {
      userId,
      vocabularyId: isVocab ? contentId : null,
      kanjiId: isVocab ? null : contentId,
      cardType: isVocab ? 'vocabulary' : 'kanji',
      interval,
      easeFactor,
      nextReview,
      lastRating: rating,
      reviewCount: 1,
    },
    update: baseData,
  })

  const xpGained = rating === 'easy' ? 10 : rating === 'good' ? 7 : rating === 'hard' ? 4 : 2
  await db.user.update({ where: { id: userId }, data: { xp: { increment: xpGained } } })
  await buildAchievementPayload(userId)

  return c.json({
    id: cardId,
    rating,
    interval,
    nextReview: nextReview.toISOString().split('T')[0],
    xpGained,
  })
})

// ── Practice ─────────────────────────────────────────────────────────────────

router.get('/api/v1/practice', requireAuth, async (c) => {
  const userId = c.get('userId') as string
  const now = new Date()
  const [user, vocabCount, kanjiCount, grammarCount, reviewEntries, todayLessons, progressEntries] = await Promise.all([
    db.user.findUnique({ where: { id: userId }, select: { studyLevel: true } }),
    db.vocabulary.count(),
    db.kanjiEntry.count(),
    db.grammarPattern.count(),
    db.flashcardReview.findMany({ where: { userId }, select: { lastRating: true, nextReview: true, reviewCount: true } }),
    db.lessonHistory.findMany({ where: { userId, completedAt: { gte: new Date(now.getFullYear(), now.getMonth(), now.getDate()) } }, select: { xpGained: true } }),
    db.userProgress.findMany({ where: { userId }, select: { category: true, mastery: true } }),
  ])

  const reviewedCount = reviewEntries.filter((entry) => entry.reviewCount > 0).length
  const dueCount = reviewEntries.filter((entry) => entry.nextReview <= now).length
  const completedReviews = reviewEntries.filter((entry) => entry.lastRating).length
  const accurateReviews = reviewEntries.filter((entry) => entry.lastRating && ['good', 'easy'].includes(entry.lastRating)).length
  const accuracy = completedReviews > 0 ? Math.round((accurateReviews / completedReviews) * 100) : 0
  const xpToday = todayLessons.reduce((sum, lesson) => sum + lesson.xpGained, 0)
  const minutesStudied = Math.max(5, Math.round((reviewedCount + todayLessons.length) * 4))

  const weakPoints = progressEntries
    .filter((entry) => typeof entry.mastery === 'number')
    .sort((a, b) => a.mastery - b.mastery)
    .slice(0, 3)
    .map((entry) => ({ topic: entry.category, accuracy: entry.mastery }))

  return c.json({
    modes: [
      { id: 'srs', title: 'SRS Flashcard Review', icon: '🃏', desc: 'Review due cards using spaced repetition.', tags: ['Vocabulary', 'Kanji'], color: '#e8a87c', dueCount },
      { id: 'stroke', title: 'Kanji Stroke Practice', icon: '✍', desc: `Practice ${kanjiCount} kanji entries from the database.`, tags: ['Kanji', 'Writing'], color: '#b07d62', dueCount: Math.min(kanjiCount, 12) },
      { id: 'grammar', title: 'Grammar Drills', icon: '文', desc: `Review ${grammarCount} grammar patterns stored in the database.`, tags: ['Grammar'], color: '#a0816a', dueCount: Math.min(grammarCount, 8) },
      { id: 'vocab', title: 'Vocabulary Quiz', icon: '語', desc: `Work through ${vocabCount} vocabulary entries from the database.`, tags: ['Vocabulary'], color: '#c97a4a', dueCount: Math.min(vocabCount, 16) },
      { id: 'reading', title: 'Reading Passages', icon: '📖', desc: 'Use your current JLPT level to guide study sessions.', tags: ['Reading'], color: '#7a8fc9', dueCount: user?.studyLevel === 'N5' ? 3 : 5 },
      { id: 'listening', title: 'Listening Drills', icon: '👂', desc: 'Practice listening with content aligned to your current level.', tags: ['Listening'], color: '#6abfa0', dueCount: user?.studyLevel === 'N3' ? 7 : 4 },
    ],
    stats: { reviewed: reviewedCount, accuracy, xpToday, minutesStudied },
    weakPoints,
  })
})

// ── Tests ─────────────────────────────────────────────────────────────────────

router.get('/api/v1/tests', (c) => {
  return c.json({
    tests: [
      { id: 't-n5', level: 'N5', title: 'N5 Full Mock Test', sections: 3, questions: 110, durationMin: 105, bestScore: 92, attempts: 3 },
      { id: 't-n4', level: 'N4', title: 'N4 Full Mock Test', sections: 3, questions: 125, durationMin: 125, bestScore: 78, attempts: 2 },
      { id: 't-n3', level: 'N3', title: 'N3 Full Mock Test', sections: 3, questions: 140, durationMin: 140, bestScore: 71, attempts: 1 },
      { id: 't-n3-vocab', level: 'N3', title: 'N3 Vocabulary Section', sections: 1, questions: 35, durationMin: 35, bestScore: 83, attempts: 4 },
      { id: 't-n3-gram', level: 'N3', title: 'N3 Grammar Section', sections: 1, questions: 45, durationMin: 50, bestScore: 68, attempts: 2 },
      { id: 't-n2', level: 'N2', title: 'N2 Full Mock Test', sections: 3, questions: 155, durationMin: 155, bestScore: null, attempts: 0 },
    ],
    readiness: { N5: 92, N4: 78, N3: 71, N2: 0, N1: 0 },
  })
})

// ── Progress & Analytics ──────────────────────────────────────────────────────

router.get('/api/v1/progress', requireAuth, async (c) => {
  const userId = c.get('userId') as string
  // Fetch user basic stats and progress entries
  const [user, progressEntries, lessons] = await Promise.all([
    db.user.findUnique({ where: { id: userId }, select: { xp: true, streakDays: true, studyLevel: true, _count: { select: { lessonHistory: true } } } }),
    db.userProgress.findMany({ where: { userId }, select: { category: true, mastery: true } }),
    db.lessonHistory.findMany({ where: { userId }, orderBy: { completedAt: 'desc' }, take: 12, select: { lessonId: true, xpGained: true, completedAt: true } }),
  ])

  if (!user) return c.json({ error: 'User not found' }, 404)

  // Map progress entries to mastery structure — Kanji/Vocabulary/Grammar totals are
  // real, level-appropriate content counts (not hardcoded), same as the dashboard.
  const contentTotals = await getCumulativeContentTotals(normalizeLevelCode(user.studyLevel))
  const totals: Record<string, number> = { Kanji: contentTotals.kanji, Vocabulary: contentTotals.vocabulary, Grammar: contentTotals.grammar }
  const mastery = progressEntries.map(p => {
    const label = p.category.charAt(0).toUpperCase() + p.category.slice(1)
    const total = totals[label] ?? null
    return {
      label,
      pct: p.mastery,
      done: total ? Math.round(total * (p.mastery / 100)) : undefined,
      total: total ?? undefined,
      color: label === 'Kanji' ? '#c97a4a' : label === 'Vocabulary' ? '#8b6f8b' : '#7d8d6a',
    }
  })

  // Weak points: pick lowest mastery entries, or fallback to empty
  const weakPoints = mastery
    .filter(m => typeof m.pct === 'number')
    .sort((a, b) => a.pct - b.pct)
    .slice(0, 3)
    .map(w => ({ topic: w.label, pct: w.pct, advice: `Focus on ${w.label.toLowerCase()} drills and reviews.` }))

  const history = lessons.map(l => ({ label: `Lesson ${l.lessonId}`, date: l.completedAt.toISOString().slice(0,10), xp: l.xpGained }))
  const xpHistory = lessons.slice(0,7).map(l => l.xpGained).reverse()

  return c.json({
    mastery,
    weakPoints,
    history,
    xpHistory,
    streak: user.streakDays,
    totalXP: user.xp,
  })
})

// ── Achievements ──────────────────────────────────────────────────────────────

router.get('/api/v1/achievements', requireAuth, async (c) => {
  const userId = c.get('userId') as string
  return c.json({ achievements: await buildAchievementPayload(userId) })
})

// ── User achievements (earned) ───────────────────────────────────────────────
router.get('/api/v1/user/achievements', requireAuth, async (c) => {
  const userId = c.get('userId') as string
  const achievements = await buildAchievementPayload(userId)
  return c.json({ achievements })
})

// ── Study Plan ────────────────────────────────────────────────────────────────

router.get('/api/v1/study-plan', (c) => {
  return c.json({
    weekOf: '2026-06-30',
    days: [
      { day: 'Mon', tasks: [{ id: 1, title: 'SRS Review (20 cards)', xp: 40, done: true }, { id: 2, title: 'N3 Kanji: 思問力', xp: 30, done: true }] },
      { day: 'Tue', tasks: [{ id: 3, title: 'Grammar: てもいい・なければ', xp: 35, done: true }, { id: 4, title: 'Vocabulary Quiz: N3 set 4', xp: 25, done: false }] },
      { day: 'Wed', tasks: [{ id: 5, title: 'SRS Review (24 cards)', xp: 48, done: false }, { id: 6, title: 'Reading: Short passage N3', xp: 40, done: false }] },
      { day: 'Thu', tasks: [{ id: 7, title: 'N3 Kanji: 変象概', xp: 30, done: false }, { id: 8, title: 'Listening drill: N3 dialogues', xp: 35, done: false }] },
      { day: 'Fri', tasks: [{ id: 9, title: 'SRS Review (20 cards)', xp: 40, done: false }, { id: 10, title: 'Grammar Drill: のに・ために', xp: 35, done: false }] },
      { day: 'Sat', tasks: [{ id: 11, title: 'N3 Section Mock Test', xp: 100, done: false }] },
      { day: 'Sun', tasks: [{ id: 12, title: 'Rest or light SRS review', xp: 20, done: false }] },
    ],
    weeklyXPTarget: 500,
    weeklyXPEarned: 173,
  })
})

// ── User / Profile (real DB) ──────────────────────────────────────────────────

router.get('/api/v1/user/profile', requireAuth, async (c) => {
  const userId = c.get('userId') as string
  const user = await db.user.findUnique({
    where: { id: userId },
    select: {
      id: true, email: true, username: true, xp: true, studyLevel: true,
      streakDays: true, lastStudied: true, createdAt: true,
      _count: { select: { flashcards: true, achievements: true, lessonHistory: true } },
    },
  })
  if (!user) return c.json({ error: 'User not found' }, 404)

  return c.json({
    username: user.username,
    email: user.email,
    displayName: user.username,
    targetLevel: user.studyLevel,
    studyGoal: ['N5', 'N4'].includes(user.studyLevel) ? 45 : user.studyLevel === 'N3' ? 60 : user.studyLevel === 'N2' ? 75 : 90,
    nativeLanguage: 'English',
    bio: `Passionate about Japanese and working toward JLPT ${user.studyLevel}.`,
    joinedDate: user.createdAt,
    lastStudied: user.lastStudied,
    stats: {
      streak: user.streakDays,
      totalXP: user.xp,
      kanjiStudied: 0,
      cardsReviewed: user._count.flashcards,
      testsTaken: 0,
      lessonsCompleted: user._count.lessonHistory,
      achievementsEarned: user._count.achievements,
    },
  })
})

router.patch('/api/v1/user/profile', requireAuth, async (c) => {
  const userId = c.get('userId') as string
  let body: { username?: string; studyLevel?: string; studyGoal?: number } = {}
  try { body = await c.req.json() } catch { /* empty body is ok */ }

  const updated = await db.user.update({
    where: { id: userId },
    data: {
      ...(body.username && { username: body.username }),
      ...(body.studyLevel && { studyLevel: body.studyLevel }),
    },
    select: { id: true, email: true, username: true, xp: true, studyLevel: true, streakDays: true },
  })
  return c.json({ success: true, user: updated })
})

export default router
