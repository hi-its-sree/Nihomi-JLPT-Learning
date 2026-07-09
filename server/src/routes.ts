import { Hono } from 'hono'
import type { Prisma } from '@prisma/client'
import { db } from './db'
import { requireAuth } from './middleware/requireAuth'
import authRoutes from './routes/auth'
import kanjiRoutes from './routes/kanji'

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
      kanji: kanjiCount,
      vocab: vocabCount,
      grammar: grammarCount,
      progress,
      current: index === currentIndex,
    }
  })
}

// ── Auth ─────────────────────────────────────────────────────────────────────

router.route('/auth', authRoutes)
router.route('/api/kanji', kanjiRoutes)
router.route('/api/v1/kanji', kanjiRoutes)

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

  const targetMeta: Record<string, { focus: string; weeklyGoal: number; baseMastery: { kanji: number; vocabulary: number; grammar: number; reading: number } }> = {
    N5: { focus: 'Build the basics: hiragana, katakana, simple grammar, and everyday vocabulary.', weeklyGoal: 300, baseMastery: { kanji: 10, vocabulary: 8, grammar: 7, reading: 6 } },
    N4: { focus: 'Strengthen everyday communication and more practical sentence patterns.', weeklyGoal: 400, baseMastery: { kanji: 16, vocabulary: 14, grammar: 12, reading: 10 } },
    N3: { focus: 'Improve reading, listening, and intermediate grammar for everyday and media contexts.', weeklyGoal: 500, baseMastery: { kanji: 22, vocabulary: 20, grammar: 18, reading: 15 } },
    N2: { focus: 'Handle longer passages, richer vocabulary, and natural speech patterns.', weeklyGoal: 600, baseMastery: { kanji: 30, vocabulary: 28, grammar: 24, reading: 20 } },
    N1: { focus: 'Aim for near-native fluency, nuanced reading, and advanced listening.', weeklyGoal: 700, baseMastery: { kanji: 38, vocabulary: 34, grammar: 30, reading: 26 } },
  }

  const target = targetMeta[targetLevel] ?? targetMeta.N5

  const vocabTotals: Record<(typeof levelOrder)[number], number> = {
    N5: 662,
    N4: 1294,
    N3: 3078,
    N2: 4871,
    N1: 8334,
  }
  const vocabTotal = vocabTotals[targetLevel] ?? 8334

  const boostFromActivity = Math.min(20, user._count.lessonHistory * 2 + user.streakDays + Math.floor(user.xp / 200))
  const masterySeed = {
    kanji: Math.min(95, target.baseMastery.kanji + boostFromActivity + (progressMap.kanji ?? 0) * 0.2),
    vocabulary: Math.min(95, target.baseMastery.vocabulary + boostFromActivity + (progressMap.vocabulary ?? 0) * 0.2),
    grammar: Math.min(95, target.baseMastery.grammar + boostFromActivity + (progressMap.grammar ?? 0) * 0.2),
    reading: Math.min(95, target.baseMastery.reading + boostFromActivity + (progressMap.reading ?? 0) * 0.2),
  }

  // If the user is brand-new (no lessons, no XP, no streak and no recorded progress)
  // treat mastery as empty so the UI shows a clear starting point instead of pre-filled values.
  const isNewUser = user._count.lessonHistory === 0 && user.xp === 0 && user.streakDays === 0 && Object.values(progressMap).every(v => !v)
  if (isNewUser) {
    masterySeed.kanji = 0
    masterySeed.vocabulary = 0
    masterySeed.grammar = 0
    masterySeed.reading = 0
  }

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
    { label: 'Kanji', done: Math.round(650 * (masterySeed.kanji / 100)), total: 650, pct: Math.round(masterySeed.kanji), color: '#c97a4a' },
    { label: 'Vocabulary', done: Math.round(vocabTotal * (masterySeed.vocabulary / 100)), total: vocabTotal, pct: Math.round(masterySeed.vocabulary), color: '#8b6f8b' },
    { label: 'Grammar', done: Math.round(120 * (masterySeed.grammar / 100)), total: 120, pct: Math.round(masterySeed.grammar), color: '#7d8d6a' },
    { label: 'Reading', done: Math.round(40 * (masterySeed.reading / 100)), total: 40, pct: Math.round(masterySeed.reading), color: '#5b8fa8' },
  ]

  const readiness = Math.min(100, Math.round((user.xp / 20) + (user.streakDays * 4) + (user._count.lessonHistory * 2) + (targetIndex * 6)))

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
      `Database vocabulary entries: ${detail.vocab}`,
      `Database kanji entries: ${detail.kanji}`,
      `Database grammar patterns: ${detail.grammar}`,
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

router.get('/api/v1/flashcards', (c) => {
  const level = c.req.query('level')
  const deck = [
    { id: 1, front: '食べる', frontReading: 'たべる', back: 'to eat', example: '毎日ご飯を食べる。', level: 'N5', srsStage: 2, nextReview: '2026-07-01' },
    { id: 2, front: '大きい', frontReading: 'おおきい', back: 'big / large', example: '大きい犬がいる。', level: 'N5', srsStage: 1, nextReview: '2026-07-01' },
    { id: 3, front: '電車', frontReading: 'でんしゃ', back: 'train', example: '電車で行きます。', level: 'N4', srsStage: 0, nextReview: '2026-06-30' },
    { id: 4, front: '静か', frontReading: 'しずか', back: 'quiet', example: '図書館は静かです。', level: 'N5', srsStage: 3, nextReview: '2026-07-03' },
    { id: 5, front: '勉強', frontReading: 'べんきょう', back: 'study', example: '毎日勉強します。', level: 'N5', srsStage: 1, nextReview: '2026-07-01' },
    { id: 6, front: '場合', frontReading: 'ばあい', back: 'case / situation', example: 'その場合はどうしますか。', level: 'N3', srsStage: 0, nextReview: '2026-06-30' },
  ]
  let result = deck
  if (level) result = result.filter(c => c.level === level)
  return c.json({ deck: result, due: result.filter(c => c.srsStage <= 1).length })
})

router.post('/api/v1/flashcards/:id/review', async (c) => {
  const id = c.req.param('id')
  const body = await c.req.json() as { rating: 'again' | 'hard' | 'good' | 'easy' }
  const intervalMap = { again: 1, hard: 3, good: 7, easy: 14 }
  const nextDays = intervalMap[body.rating] ?? 1
  const nextDate = new Date()
  nextDate.setDate(nextDate.getDate() + nextDays)
  return c.json({ id, rating: body.rating, nextReview: nextDate.toISOString().split('T')[0], xpGained: body.rating === 'easy' ? 10 : body.rating === 'good' ? 7 : 3 })
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
    db.user.findUnique({ where: { id: userId }, select: { xp: true, streakDays: true, _count: { select: { lessonHistory: true } } } }),
    db.userProgress.findMany({ where: { userId }, select: { category: true, mastery: true } }),
    db.lessonHistory.findMany({ where: { userId }, orderBy: { completedAt: 'desc' }, take: 12, select: { lessonId: true, xpGained: true, completedAt: true } }),
  ])

  if (!user) return c.json({ error: 'User not found' }, 404)

  // Map progress entries to mastery structure
  const totals: Record<string, number> = { Kanji: 650, Vocabulary: 8334, Grammar: 120, Reading: 40, Listening: 36 }
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

router.get('/api/v1/achievements', (c) => {
  return c.json({
    achievements: [
      { id: 'first_lesson', title: 'First Step', desc: 'Complete your first lesson.', icon: '🌱', rarity: 'Common', xp: 50, earned: true, date: '2026-05-01' },
      { id: 'streak_7', title: 'Week Warrior', desc: 'Maintain a 7-day study streak.', icon: '🔥', rarity: 'Uncommon', xp: 100, earned: true, date: '2026-05-10' },
      { id: 'n5_complete', title: 'N5 Graduate', desc: 'Complete all N5 lessons.', icon: '🎓', rarity: 'Rare', xp: 200, earned: true, date: '2026-05-20' },
      { id: 'kanji_50', title: 'Kanji Collector', desc: 'Study 50 unique kanji.', icon: '字', rarity: 'Common', xp: 75, earned: true, date: '2026-05-15' },
      { id: 'test_pass_n5', title: 'N5 Certified', desc: 'Score 90%+ on an N5 mock test.', icon: '📋', rarity: 'Uncommon', xp: 150, earned: true, date: '2026-06-01' },
      { id: 'streak_30', title: 'Monthly Master', desc: 'Maintain a 30-day study streak.', icon: '🗓', rarity: 'Rare', xp: 300, earned: false, date: null },
      { id: 'kanji_200', title: 'Kanji Scholar', desc: 'Study 200 unique kanji.', icon: '🏛', rarity: 'Epic', xp: 500, earned: false, date: null },
      { id: 'n1_complete', title: 'Fluency Achieved', desc: 'Complete all N1 lessons.', icon: '🏆', rarity: 'Legendary', xp: 2000, earned: false, date: null },
    ],
  })
})

// ── User achievements (earned) ───────────────────────────────────────────────
router.get('/api/v1/user/achievements', requireAuth, async (c) => {
  const userId = c.get('userId') as string
  const earned = await db.userAchievement.findMany({ where: { userId }, select: { achievementId: true, earnedAt: true } })

  const master = [
    { id: 'first_lesson', title: 'First Step', desc: 'Complete your first lesson.', icon: '🌱', rarity: 'Common', xp: 50 },
    { id: 'streak_7', title: 'Week Warrior', desc: 'Maintain a 7-day study streak.', icon: '🔥', rarity: 'Uncommon', xp: 100 },
    { id: 'n5_complete', title: 'N5 Graduate', desc: 'Complete all N5 lessons.', icon: '🎓', rarity: 'Rare', xp: 200 },
    { id: 'kanji_50', title: 'Kanji Collector', desc: 'Study 50 unique kanji.', icon: '字', rarity: 'Common', xp: 75 },
    { id: 'test_pass_n5', title: 'N5 Certified', desc: 'Score 90%+ on an N5 mock test.', icon: '📋', rarity: 'Uncommon', xp: 150 },
    { id: 'streak_30', title: 'Monthly Master', desc: 'Maintain a 30-day study streak.', icon: '🗓', rarity: 'Rare', xp: 300 },
    { id: 'kanji_200', title: 'Kanji Scholar', desc: 'Study 200 unique kanji.', icon: '🏛', rarity: 'Epic', xp: 500 },
    { id: 'n1_complete', title: 'Fluency Achieved', desc: 'Complete all N1 lessons.', icon: '🏆', rarity: 'Legendary', xp: 2000 },
  ]

  const earnedIds = new Set(earned.map(e => e.achievementId))
  const earnedList = master.filter(m => earnedIds.has(m.id)).map(m => ({ ...m, earned: true, date: earned.find(e => e.achievementId === m.id)?.earnedAt ?? null }))

  return c.json({ achievements: earnedList })
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
