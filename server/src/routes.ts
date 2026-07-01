import { Hono } from 'hono'
import { db } from './db'
import { requireAuth } from './middleware/requireAuth'
import authRoutes from './routes/auth'

const router = new Hono()

// ── Auth ─────────────────────────────────────────────────────────────────────

router.route('/auth', authRoutes)

// ── Health ───────────────────────────────────────────────────────────────────

router.get('/health', (c) => {
  return c.json({ status: 'ok', service: 'jlpt-learning-api' })
})

// ── Dashboard (real DB) ──────────────────────────────────────────────────────

router.get('/api/v1/dashboard', requireAuth, async (c) => {
  const userId = c.get('userId') as string
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { username: true, xp: true, streakDays: true, studyLevel: true, lastStudied: true },
  })
  if (!user) return c.json({ error: 'User not found' }, 404)

  return c.json({
    message: `Welcome back, ${user.username}!`,
    stats: {
      streak: user.streakDays,
      xp: user.xp,
      readiness: 82,
      lessonsCompleted: 24,
    },
    todayPlan: [
      { id: 1, title: 'SRS Flashcard Review', icon: '🃏', duration: '15 min', xp: 40, done: false },
      { id: 2, title: 'Kanji: 山 水 火 木', icon: '字', duration: '10 min', xp: 30, done: true },
      { id: 3, title: `${user.studyLevel} Grammar Drill`, icon: '文', duration: '12 min', xp: 35, done: false },
      { id: 4, title: 'Reading Practice', icon: '📖', duration: '20 min', xp: 50, done: false },
    ],
    recentActivity: [
      { label: 'Completed N5 Kanji Chapter', time: '2h ago', xp: 60 },
      { label: 'Flashcard session — 94% accuracy', time: '5h ago', xp: 45 },
      { label: 'Mock Test N4 — 78%', time: 'Yesterday', xp: 100 },
    ],
  })
})

// ── Levels ───────────────────────────────────────────────────────────────────

router.get('/api/v1/levels', (c) => {
  return c.json({
    levels: [
      { code: 'N5', title: 'Beginner', kanji: 103, vocab: 800, grammar: 68, progress: 72, current: false },
      { code: 'N4', title: 'Elementary', kanji: 181, vocab: 1500, grammar: 84, progress: 45, current: false },
      { code: 'N3', title: 'Intermediate', kanji: 367, vocab: 3000, grammar: 113, progress: 28, current: true },
      { code: 'N2', title: 'Upper Intermediate', kanji: 367, vocab: 6000, grammar: 182, progress: 0, current: false },
      { code: 'N1', title: 'Advanced', kanji: 1118, vocab: 10000, grammar: 212, progress: 0, current: false },
    ],
  })
})

router.get('/api/v1/levels/:levelId', (c) => {
  const level = c.req.param('levelId').toUpperCase()
  const data: Record<string, { code: string; title: string; focus: string; outcomes: string[]; kanji: number; vocab: number; grammar: number }> = {
    N5: { code: 'N5', title: 'Beginner', focus: 'Hiragana, Katakana, 103 Kanji, basic grammar', outcomes: ['Introduce yourself', 'Ask for directions', 'Talk about daily routines', 'Count and tell time'], kanji: 103, vocab: 800, grammar: 68 },
    N4: { code: 'N4', title: 'Elementary', focus: '284 total Kanji, everyday conversation', outcomes: ['Discuss hobbies', 'Express opinions', 'Navigate daily life in Japan', 'Read simple texts'], kanji: 181, vocab: 1500, grammar: 84 },
    N3: { code: 'N3', title: 'Intermediate', focus: '650 total Kanji, complex grammar patterns', outcomes: ['Read news headlines', 'Hold casual conversations', 'Understand TV drama context', 'Write semi-formal emails'], kanji: 367, vocab: 3000, grammar: 113 },
    N2: { code: 'N2', title: 'Upper Intermediate', focus: '1017 total Kanji, near-natural speech', outcomes: ['Read newspaper articles', 'Understand lectures', 'Write formal documents', 'Pass most job requirements'], kanji: 367, vocab: 6000, grammar: 182 },
    N1: { code: 'N1', title: 'Advanced', focus: '2136 total Kanji, near-native proficiency', outcomes: ['Read literature', 'Understand abstract discussions', 'Work in Japanese', 'Watch any media without subtitles'], kanji: 1118, vocab: 10000, grammar: 212 },
  }
  const detail = data[level]
  if (!detail) return c.json({ error: 'Level not found' }, 404)
  return c.json(detail)
})

// ── Kanji ─────────────────────────────────────────────────────────────────────

router.get('/api/v1/kanji', (c) => {
  const level = c.req.query('level')
  const search = c.req.query('search')
  const kanji = [
    { id: '日', char: '日', meaning: 'Sun / Day', reading: 'にち、にっ、ひ', level: 'N5', strokes: 4 },
    { id: '本', char: '本', meaning: 'Origin / Book', reading: 'ほん、もと', level: 'N5', strokes: 5 },
    { id: '語', char: '語', meaning: 'Language / Words', reading: 'ご、かた(る)', level: 'N5', strokes: 14 },
    { id: '山', char: '山', meaning: 'Mountain', reading: 'さん、やま', level: 'N5', strokes: 3 },
    { id: '水', char: '水', meaning: 'Water', reading: 'すい、みず', level: 'N5', strokes: 4 },
    { id: '学', char: '学', meaning: 'Study / Learning', reading: 'がく、まな(ぶ)', level: 'N5', strokes: 8 },
    { id: '食', char: '食', meaning: 'Eat / Food', reading: 'しょく、た(べる)', level: 'N5', strokes: 9 },
    { id: '時', char: '時', meaning: 'Time / Hour', reading: 'じ、とき', level: 'N5', strokes: 10 },
    { id: '人', char: '人', meaning: 'Person', reading: 'じん、にん、ひと', level: 'N5', strokes: 2 },
    { id: '大', char: '大', meaning: 'Big / Large', reading: 'だい、おお(きい)', level: 'N5', strokes: 3 },
    { id: '国', char: '国', meaning: 'Country', reading: 'こく、くに', level: 'N4', strokes: 8 },
    { id: '会', char: '会', meaning: 'Meeting / Gather', reading: 'かい、あ(う)', level: 'N4', strokes: 6 },
    { id: '電', char: '電', meaning: 'Electricity', reading: 'でん', level: 'N4', strokes: 13 },
    { id: '話', char: '話', meaning: 'Talk / Story', reading: 'わ、はな(す)', level: 'N4', strokes: 13 },
    { id: '社', char: '社', meaning: 'Company / Shrine', reading: 'しゃ', level: 'N4', strokes: 7 },
    { id: '思', char: '思', meaning: 'Think', reading: 'し、おも(う)', level: 'N3', strokes: 9 },
    { id: '問', char: '問', meaning: 'Question / Problem', reading: 'もん、と(う)', level: 'N3', strokes: 11 },
    { id: '力', char: '力', meaning: 'Power / Strength', reading: 'りょく、ちから', level: 'N3', strokes: 2 },
    { id: '変', char: '変', meaning: 'Change / Strange', reading: 'へん、か(わる)', level: 'N2', strokes: 9 },
    { id: '象', char: '象', meaning: 'Elephant / Phenomenon', reading: 'しょう、ぞう', level: 'N2', strokes: 12 },
    { id: '概', char: '概', meaning: 'Approximate / Outline', reading: 'がい', level: 'N1', strokes: 14 },
    { id: '潜', char: '潜', meaning: 'Submerge / Hide', reading: 'せん、もぐ(る)', level: 'N1', strokes: 15 },
  ]
  let result = kanji
  if (level) result = result.filter(k => k.level === level)
  if (search) result = result.filter(k => k.char.includes(search) || k.meaning.toLowerCase().includes(search.toLowerCase()))
  return c.json({ kanji: result, total: result.length })
})

router.get('/api/v1/kanji/:id', (c) => {
  const id = decodeURIComponent(c.req.param('id'))
  const info: Record<string, { on: string; kun: string; level: string; strokes: number; meaning: string; examples: Array<{ word: string; reading: string; meaning: string }> }> = {
    '日': { on: 'にち、じつ', kun: 'ひ、か', level: 'N5', strokes: 4, meaning: 'Sun / Day', examples: [{ word: '日本', reading: 'にほん', meaning: 'Japan' }, { word: '日曜日', reading: 'にちようび', meaning: 'Sunday' }] },
    '水': { on: 'すい', kun: 'みず', level: 'N5', strokes: 4, meaning: 'Water', examples: [{ word: '水曜日', reading: 'すいようび', meaning: 'Wednesday' }, { word: '水道', reading: 'すいどう', meaning: 'Water supply' }] },
    '山': { on: 'さん', kun: 'やま', level: 'N5', strokes: 3, meaning: 'Mountain', examples: [{ word: '富士山', reading: 'ふじさん', meaning: 'Mt. Fuji' }, { word: '山道', reading: 'やまみち', meaning: 'Mountain path' }] },
    '学': { on: 'がく', kun: 'まな(ぶ)', level: 'N5', strokes: 8, meaning: 'Study / Learning', examples: [{ word: '学校', reading: 'がっこう', meaning: 'School' }, { word: '大学', reading: 'だいがく', meaning: 'University' }] },
  }
  const detail = info[id]
  if (!detail) return c.json({ error: 'Kanji not found' }, 404)
  return c.json({ ...detail, char: id })
})

// ── Vocabulary ────────────────────────────────────────────────────────────────

router.get('/api/v1/vocabulary', (c) => {
  const level = c.req.query('level')
  const stage = c.req.query('stage')
  const vocab = [
    { id: 1, word: '食べる', reading: 'たべる', meaning: 'to eat', pos: 'Verb', level: 'N5', stage: 'known', example: 'ご飯を食べる。', exTl: 'I eat rice.' },
    { id: 2, word: '飲む', reading: 'のむ', meaning: 'to drink', pos: 'Verb', level: 'N5', stage: 'review', example: '水を飲む。', exTl: 'I drink water.' },
    { id: 3, word: '大きい', reading: 'おおきい', meaning: 'big / large', pos: 'Adj-i', level: 'N5', stage: 'known', example: '大きい犬。', exTl: 'A big dog.' },
    { id: 4, word: '静か', reading: 'しずか', meaning: 'quiet / calm', pos: 'Adj-na', level: 'N5', stage: 'new', example: '静かな場所。', exTl: 'A quiet place.' },
    { id: 5, word: '走る', reading: 'はしる', meaning: 'to run', pos: 'Verb', level: 'N5', stage: 'review', example: '公園で走る。', exTl: 'I run in the park.' },
    { id: 6, word: '勉強する', reading: 'べんきょうする', meaning: 'to study', pos: 'Verb', level: 'N5', stage: 'new', example: '日本語を勉強する。', exTl: 'I study Japanese.' },
    { id: 7, word: '電車', reading: 'でんしゃ', meaning: 'train', pos: 'Noun', level: 'N4', stage: 'review', example: '電車に乗る。', exTl: 'I ride the train.' },
    { id: 8, word: '場合', reading: 'ばあい', meaning: 'case / situation', pos: 'Noun', level: 'N3', stage: 'new', example: 'その場合は連絡してください。', exTl: 'In that case, please contact me.' },
    { id: 9, word: '驚く', reading: 'おどろく', meaning: 'to be surprised', pos: 'Verb', level: 'N3', stage: 'new', example: '彼女は驚いた。', exTl: 'She was surprised.' },
    { id: 10, word: '概念', reading: 'がいねん', meaning: 'concept / notion', pos: 'Noun', level: 'N1', stage: 'new', example: '新しい概念を学ぶ。', exTl: 'Learn a new concept.' },
  ]
  let result = vocab
  if (level) result = result.filter(v => v.level === level)
  if (stage) result = result.filter(v => v.stage === stage)
  return c.json({ vocab: result, total: result.length })
})

// ── Grammar ───────────────────────────────────────────────────────────────────

router.get('/api/v1/grammar', (c) => {
  const level = c.req.query('level')
  const grammar = [
    { id: 1, pattern: '〜は〜です', meaning: 'Topic is [noun]', level: 'N5', structure: '[Topic]は[Noun]です', example: 'わたしは学生です。', exTl: 'I am a student.' },
    { id: 2, pattern: '〜が好きです', meaning: 'I like ~', level: 'N5', structure: '[Noun]が好きです', example: '日本語が好きです。', exTl: 'I like Japanese.' },
    { id: 3, pattern: '〜てもいいですか', meaning: 'May I do ~?', level: 'N5', structure: '[V-te]もいいですか', example: 'ここに座ってもいいですか。', exTl: 'May I sit here?' },
    { id: 4, pattern: '〜なければならない', meaning: 'Must do ~', level: 'N4', structure: '[V-nai stem]なければならない', example: '宿題をしなければならない。', exTl: 'I must do my homework.' },
    { id: 5, pattern: '〜のに', meaning: 'Even though ~ / For ~', level: 'N3', structure: '[V/Adj]のに[contrast]', example: '頑張ったのに失敗した。', exTl: 'Even though I tried hard, I failed.' },
    { id: 6, pattern: '〜にもかかわらず', meaning: 'Despite ~ / In spite of ~', level: 'N2', structure: '[Noun/V]にもかかわらず', example: '雨にもかかわらず試合は続いた。', exTl: 'Despite the rain, the game continued.' },
  ]
  let result = grammar
  if (level) result = result.filter(g => g.level === level)
  return c.json({ grammar: result, total: result.length })
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

router.get('/api/v1/practice', (c) => {
  return c.json({
    modes: [
      { id: 'srs', title: 'SRS Flashcard Review', icon: '🃏', desc: 'Review due cards using spaced repetition.', tags: ['Vocabulary', 'Kanji'], color: '#e8a87c', dueCount: 24 },
      { id: 'stroke', title: 'Kanji Stroke Practice', icon: '✍', desc: 'Trace stroke order for N5–N3 kanji.', tags: ['Kanji', 'Writing'], color: '#b07d62', dueCount: 12 },
      { id: 'grammar', title: 'Grammar Drills', icon: '文', desc: 'Fill-in-the-blank pattern practice.', tags: ['Grammar'], color: '#a0816a', dueCount: 8 },
      { id: 'vocab', title: 'Vocabulary Quiz', icon: '語', desc: 'Multiple-choice and meaning recall.', tags: ['Vocabulary'], color: '#c97a4a', dueCount: 16 },
      { id: 'reading', title: 'Reading Passages', icon: '📖', desc: 'Short texts with comprehension questions.', tags: ['Reading'], color: '#7a8fc9', dueCount: 3 },
      { id: 'listening', title: 'Listening Drills', icon: '👂', desc: 'Audio clips with answer selection.', tags: ['Listening'], color: '#6abfa0', dueCount: 5 },
    ],
    stats: { reviewed: 48, accuracy: 87, xpToday: 145, minutesStudied: 34 },
    weakPoints: [{ topic: 'て-form conjugation', accuracy: 61 }, { topic: 'N3 Kanji readings', accuracy: 53 }],
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

router.get('/api/v1/progress', (c) => {
  return c.json({
    mastery: [
      { skill: 'Kanji', pct: 42, studied: 276, total: 650 },
      { skill: 'Vocabulary', pct: 38, studied: 1140, total: 3000 },
      { skill: 'Grammar', pct: 55, studied: 62, total: 113 },
      { skill: 'Reading', pct: 30, score: 30 },
      { skill: 'Listening', pct: 25, score: 25 },
    ],
    weakPoints: [
      { topic: 'て-form conjugation', pct: 61, advice: 'Practice combining verbs into て-form chains using the Grammar Drills.' },
      { topic: 'N3 Kanji readings', pct: 53, advice: 'Use the Kanji Studio to review on/kun readings for recently failed cards.' },
      { topic: 'Listening speed', pct: 48, advice: 'Try listening passages at 0.75× speed, then work up to natural pace.' },
    ],
    history: [
      { label: 'N5 Mock Test', date: '2026-06-01', score: 92, level: 'N5' },
      { label: 'N4 Mock Test', date: '2026-06-12', score: 78, level: 'N4' },
      { label: 'N3 Vocabulary', date: '2026-06-20', score: 83, level: 'N3' },
      { label: 'N3 Full Mock', date: '2026-06-28', score: 71, level: 'N3' },
    ],
    xpHistory: [120, 85, 200, 145, 310, 95, 180],
    streak: 7,
    totalXP: 1250,
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
    targetLevel: user.studyLevel,
    studyGoal: 60,
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
