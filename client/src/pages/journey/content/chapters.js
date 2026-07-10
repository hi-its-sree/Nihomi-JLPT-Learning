// Single source of truth for chapter ordering + metadata across the whole
// Beginner Journey module. Chapter ids here MUST exactly match the keys in
// server/src/routes/journey.ts's CHAPTER_REWARDS table.

export const CHAPTER_ORDER = [
  'welcome',
  'jlpt-overview',
  'writing-systems',
  'first-hiragana',
  'first-katakana',
  'first-kanji',
  'study-effectively',
  'daily-conversation',
  'japanese-culture',
  'complete',
]

export const CHAPTERS = {
  welcome: {
    id: 'welcome', order: 1, route: '/journey/welcome',
    title: 'Welcome to Japan', jp: '日本へようこそ', icon: '✈️', color: '#c97a4a',
    summary: 'Land in Japan, hear your first Japanese, and discover why millions of people fall in love with this language.',
    learnPoints: ['Why people learn Japanese', 'What travel, anime, work & culture unlock', 'What this journey covers'],
    xp: 50, badgeIds: ['journey_welcome'],
  },
  'jlpt-overview': {
    id: 'jlpt-overview', order: 2, route: '/journey/jlpt-overview',
    title: 'What is the JLPT?', jp: 'JLPTとは？', icon: '🗺️', color: '#059669',
    summary: 'Meet the five-level mountain you are about to climb — from N5 base camp to N1 summit.',
    learnPoints: ['N5 → N1 explained simply', 'The mountain/RPG-level metaphor', 'Where your journey fits in'],
    xp: 40, badgeIds: ['journey_jlpt_map'],
  },
  'writing-systems': {
    id: 'writing-systems', order: 3, route: '/journey/writing-systems',
    title: 'Japanese Writing Systems', jp: '日本語の文字', icon: '✍️', color: '#0284c7',
    summary: 'Hiragana, katakana, kanji — three scripts, one language. Tap to discover what each one is for.',
    learnPoints: ['Hiragana vs katakana vs kanji', 'Why Japanese uses all three', 'How to spot each one on sight'],
    xp: 40, badgeIds: [],
  },
  'first-hiragana': {
    id: 'first-hiragana', order: 4, route: '/journey/first-hiragana',
    title: 'First Hiragana', jp: 'はじめてのひらがな', icon: '🌸', color: '#db2777',
    summary: 'Learn your first 10 hiragana characters — the foundation of every Japanese sentence.',
    learnPoints: ['あ・い・う・え・お・か・き・く・け・こ', 'Matching sounds to shapes', 'Recognition quiz'],
    xp: 75, badgeIds: ['journey_hiragana'],
  },
  'first-katakana': {
    id: 'first-katakana', order: 5, route: '/journey/first-katakana',
    title: 'First Katakana', jp: 'はじめてのカタカナ', icon: '🗾', color: '#7c3aed',
    summary: 'Katakana spells out foreign words — コーヒー, ホテル, ピザ. Learn to read the words you already know.',
    learnPoints: ['ア・イ・ウ・エ・オ・カ・キ・ク・ケ・コ', 'Loanwords from English', 'Recognition exercises'],
    xp: 75, badgeIds: ['journey_katakana'],
  },
  'first-kanji': {
    id: 'first-kanji', order: 6, route: '/journey/first-kanji',
    title: 'First Kanji', jp: 'はじめての漢字', icon: '🖌', color: '#b45309',
    summary: 'Meet 日人山水学 — five kanji that unlock meaning at a glance.',
    learnPoints: ['Meaning, reading & stroke count', 'Simple memory techniques', 'Your first kanji story'],
    xp: 75, badgeIds: ['journey_kanji'],
  },
  'study-effectively': {
    id: 'study-effectively', order: 7, route: '/journey/study-effectively',
    title: 'How to Study Effectively', jp: '効果的な勉強法', icon: '📅', color: '#0f766e',
    summary: 'The habits that actually get people to N5 — daily missions, spaced repetition, and a realistic weekly plan.',
    learnPoints: ['Daily habits that compound', 'Why spaced repetition works', 'Build your first weekly plan'],
    xp: 40, badgeIds: [],
  },
  'daily-conversation': {
    id: 'daily-conversation', order: 8, route: '/journey/daily-conversation',
    title: 'Daily Conversation', jp: '日常会話', icon: '💬', color: '#c9a84c',
    summary: 'Seven real-life scenarios — meet someone, order food, ask directions — as interactive dialogues, not textbook drills.',
    learnPoints: ['7 branching conversation scenarios', 'Choose your response, get feedback', 'Sound natural in real situations'],
    xp: 120, badgeIds: ['journey_conversationalist'],
  },
  'japanese-culture': {
    id: 'japanese-culture', order: 9, route: '/journey/japanese-culture',
    title: 'Japanese Culture', jp: '日本文化', icon: '⛩', color: '#be123c',
    summary: 'Bowing, honorifics, trains, convenience stores — the everyday culture behind the language.',
    learnPoints: ['9 flip-card culture topics', 'Fun facts & etiquette', 'A closing culture quiz'],
    xp: 60, badgeIds: ['journey_culture'],
  },
  complete: {
    id: 'complete', order: 10, route: '/journey/complete',
    title: 'Journey Complete', jp: '旅の終わり、そして始まり', icon: '🎉', color: '#c97a4a',
    summary: 'Your beginner certificate — see everything you have earned before stepping into N5.',
    learnPoints: ['Your full XP & badge summary', 'A certificate to mark the moment', 'Your first step into N5'],
    xp: 100, badgeIds: ['journey_graduate'],
  },
}

export const TOTAL_JOURNEY_XP = CHAPTER_ORDER.reduce((sum, id) => sum + CHAPTERS[id].xp, 0)
