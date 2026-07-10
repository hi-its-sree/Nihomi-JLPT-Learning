import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence, useInView } from 'framer-motion'
import { Link } from 'react-router-dom'
import api from '../lib/api'

// ── Accurate JLPT Data ────────────────────────────────────────────────────────

const LEVELS = [
  {
    code: 'N5', label: 'Beginner', jp: '初級',
    color: '#059669', glow: '#34d39955', darkColor: '#047857',
    status: 'complete', progress: 100, xp: 1200,
    icon: '🌱', emoji: '🌱',

    overview: 'N5 is the entry point into Japanese. You will learn to read and write hiragana and katakana — the two phonetic scripts that form the foundation of all Japanese text. With 103 kanji, 662 vocabulary words, and essential grammar patterns, you will be able to handle simple everyday situations.',
    whoFor: 'Complete beginners with zero prior Japanese knowledge.',
    studyHours: { min: 150, max: 300, note: 'for an English speaker starting from scratch' },

    stats: { kanji: 103, vocab: 662, grammar: 68 },
    readingLevel:   { label: 'Very Simple',   score: 1, desc: 'Hiragana, katakana, and a few basic kanji. Very short sentences.' },
    listeningLevel: { label: 'Slow & Clear',  score: 1, desc: 'Slow, clear speech on familiar everyday topics.' },

    communication: [
      'Introduce yourself and others',
      'Ask simple yes/no questions',
      'Talk about daily routines',
      'Express likes and dislikes',
      'Read basic signs and menus',
      'Count, tell time, and use dates',
    ],
    realWorld: [
      { icon: '✈️', label: 'Basic travel in Japan' },
      { icon: '🍜', label: 'Ordering at restaurants' },
      { icon: '🛒', label: 'Shopping and prices' },
      { icon: '🗺️', label: 'Asking for directions' },
      { icon: '👋', label: 'Greeting and social niceties' },
    ],
    whatsNew: [
      'Hiragana (46 characters) — the core Japanese phonetic alphabet',
      'Katakana (46 characters) — used for foreign loanwords and emphasis',
      'Topic particle は and subject particle が',
      'Object particle を, location particles に and で',
      'Verb dictionary form and polite ます / です conjugation',
      'Basic adjective types: い-adjectives and な-adjectives',
      'Time expressions: days, months, hours',
    ],
    skillsUnlocked: ['Read hiragana & katakana fluently', 'Write basic sentences', 'Recognise 103 kanji', 'Survive basic travel scenarios', 'Understand slow native speakers'],
    prerequisites: ['No prerequisites — this is where your journey begins!'],

    curriculum: [
      { icon: '✍️', title: 'Writing System', desc: 'Master all 46 hiragana and 46 katakana characters. These are the foundation — every Japanese text uses them. You will also be introduced to the concept of kanji as meaning-based characters.' },
      { icon: '字', title: 'Kanji', desc: '103 essential kanji covering numbers (一二三), nature (山水火木), directions, family, time, and common nouns. Focus on recognition and basic reading.' },
      { icon: '語', title: 'Vocabulary', desc: '662 core words used in daily life — greetings, numbers, colours, body parts, food, transport, and simple verbs and adjectives. All words appear in hiragana and kanji forms.' },
      { icon: '文', title: 'Grammar', desc: '68 foundational patterns including sentence structure (S + O + V), particle usage (は が を に で), polite verb forms (〜ます / 〜です), and basic question formation (〜か).' },
      { icon: '📖', title: 'Reading', desc: 'Very short passages (3–5 sentences) using hiragana, katakana, and basic kanji. Topics: notices, menus, timetables. Furigana (reading aids) are always provided.' },
      { icon: '👂', title: 'Listening', desc: 'Short monologues and dialogues on familiar topics — introductions, shopping, schedules. Speech is slow and clearly articulated. No background noise.' },
      { icon: '🎯', title: 'Practice', desc: 'Stroke-order kanji tracing, SRS flashcard drills for vocabulary, fill-in-the-blank grammar exercises, and listening comprehension checks.' },
      { icon: '📋', title: 'Mock Tests', desc: 'Timed N5 mock tests (3 sections: Language Knowledge, Reading, Listening). ~110 questions, 105 minutes. Practice until you consistently score 80%+ before advancing.' },
    ],
  },

  {
    code: 'N4', label: 'Elementary', jp: '基礎',
    color: '#0284c7', glow: '#38bdf855', darkColor: '#0369a1',
    status: 'complete', progress: 72, xp: 860,
    icon: '🌿', emoji: '🌿',

    overview: 'N4 builds directly on N5 foundations, expanding your grammar toolkit and vocabulary to handle real everyday conversations. You will learn important verb conjugation patterns (て-form, conditional, potential, passive) that are central to natural Japanese. At N4, you can navigate most daily life situations in Japan.',
    whoFor: 'Learners who have completed N5 or have ~150–300 hours of Japanese study.',
    studyHours: { min: 300, max: 600, note: 'total study time from zero' },

    stats: { kanji: 284, vocab: 632, grammar: 84 },
    readingLevel:   { label: 'Simple',       score: 2, desc: 'Short passages on everyday topics. Basic kanji with furigana support.' },
    listeningLevel: { label: 'Near-Natural', score: 2, desc: 'Conversations at near-natural speed on familiar topics. Some inference needed.' },

    communication: [
      'Hold basic conversations on familiar topics',
      'Describe experiences in past, present, future',
      'Ask for and give advice',
      'Express ability (can/cannot do)',
      'Discuss preferences, hobbies, and opinions',
      'Read simple instructions and short articles',
    ],
    realWorld: [
      { icon: '🏥', label: 'At the hospital or clinic' },
      { icon: '🏪', label: 'Retail and service situations' },
      { icon: '📞', label: 'Simple phone calls' },
      { icon: '🏢', label: 'Workplace introductions' },
      { icon: '📰', label: 'Reading easy notices & signs' },
    ],
    whatsNew: [
      'て-form verb conjugation and its many uses (〜ている, 〜てください, 〜てもいい)',
      'Conditional forms: 〜たら (if/when), 〜と (natural consequence), 〜ば (supposition)',
      'Potential form: 〜られる / できる (can do)',
      'Passive voice: 〜られる (being done to)',
      'Giving and receiving verbs: あげる, くれる, もらう',
      'Verb nominalisation: 〜こと and 〜の',
      'Comparative expressions: 〜より, 〜のほうが',
      'て-form chains for sequential actions',
    ],
    skillsUnlocked: ['Navigate daily life in Japan', 'Hold short conversations', 'Read simple passages', 'Express necessity and permission', 'Recognise 284 kanji total'],
    prerequisites: ['N5 completion or equivalent', 'Hiragana & katakana fluency', 'Basic verb dictionary forms', '662+ vocabulary words'],

    curriculum: [
      { icon: '✍️', title: 'Writing System', desc: 'Hiragana and katakana are now assumed. Focus shifts to reading mixed scripts (kanji + kana) fluently. Introduction to kanji compound words (熟語).' },
      { icon: '字', title: 'Kanji', desc: '181 new kanji added to the N5 base (284 total). Covers verbs (食 読 書), body parts (頭 手 足), places (駅 店 公園), and common adjectives. Reading and writing practice.' },
      { icon: '語', title: 'Vocabulary', desc: '632 level-specific words. New additions: verbs of motion, adjectives of emotion, transport vocabulary, work and school terminology, and connective expressions.' },
      { icon: '文', title: 'Grammar', desc: '84 new patterns. Highlights: て-form chains, conditionals (〜たら・〜と・〜ば), potential (〜られる), passive (〜られる), giving/receiving (あげる・くれる・もらう), and 〜ほうがいい (advice).' },
      { icon: '📖', title: 'Reading', desc: 'Short passages (6–10 sentences) on topics like schedules, instructions, postcards, and diary entries. Some kanji without furigana. Reading for main idea and key details.' },
      { icon: '👂', title: 'Listening', desc: 'Conversations at near-natural speed between two speakers. Topics include plans, requests, descriptions of events. Some inference and context clues needed.' },
      { icon: '🎯', title: 'Practice', desc: 'Conjugation drills for all new verb forms. Role-play conversations. Reading comprehension with time limits. SRS flashcards with example sentences for all vocabulary.' },
      { icon: '📋', title: 'Mock Tests', desc: 'N4 format: Language Knowledge (Vocabulary + Grammar), Reading, Listening. ~125 questions, 125 minutes. Target 80%+ before moving to N3.' },
    ],
  },

  {
    code: 'N3', label: 'Intermediate', jp: '中級',
    color: '#7c3aed', glow: '#a78bfa55', darkColor: '#6d28d9',
    status: 'current', progress: 38, xp: 410,
    icon: '🏮', emoji: '🏮',

    overview: 'N3 is the critical bridge between beginner and intermediate Japanese. It introduces more natural, complex sentence structures and a significantly larger vocabulary. You will begin reading real-world texts — news headlines, informal emails, product descriptions — and understanding natural-paced listening passages. N3 is widely recognised as a practical threshold for daily life in Japan.',
    whoFor: 'Learners who have passed N4 or have approximately 450–600 total hours of study.',
    studyHours: { min: 450, max: 900, note: 'total study time; ~150–300 additional hours from N4' },

    stats: { kanji: 650, vocab: 1784, grammar: 113 },
    readingLevel:   { label: 'Intermediate',  score: 3, desc: 'Multi-paragraph texts, news headlines, informal writing. Mixed kanji without furigana.' },
    listeningLevel: { label: 'Natural Speed', score: 3, desc: 'Full natural-speed conversations. Background context and inference essential.' },

    communication: [
      'Discuss current events and opinions',
      'Express nuanced emotions and reactions',
      'Handle unexpected situations',
      'Read and write semi-formal emails',
      'Follow radio and podcast content (familiar topics)',
      'Participate in group conversations',
    ],
    realWorld: [
      { icon: '📰', label: 'Reading news headlines' },
      { icon: '💼', label: 'Basic workplace communication' },
      { icon: '🎬', label: 'Watching TV dramas with subtitles' },
      { icon: '✉️', label: 'Writing semi-formal emails' },
      { icon: '🤝', label: 'Social and professional networking' },
    ],
    whatsNew: [
      'Complex conjunctions: 〜のに (even though), 〜ために (in order to), 〜ながら (while doing)',
      'Causative form: 〜させる (make/let someone do)',
      'Causative-passive: 〜させられる (be made to do)',
      'Expressing reason/result: 〜から・〜ので・〜ため',
      'Formal expressions: 〜ことができる, 〜ようになる, 〜ようにする',
      'Nominalisation and embedded clauses',
      'Conjunctive expressions: 〜し, 〜が, 〜けれども',
      'Expressing degree: 〜ほど, 〜くらい, 〜さえ',
    ],
    skillsUnlocked: ['Read mixed-script texts without furigana', 'Understand natural-speed dialogue', 'Express complex ideas in writing', 'Navigate workplace basics', 'Recognise 650 total kanji'],
    prerequisites: ['N4 completion or equivalent', 'Solid て-form and conditional mastery', 'Basic passive and potential forms', '1,294+ vocabulary words'],

    curriculum: [
      { icon: '✍️', title: 'Writing System', desc: 'All texts are now in natural mixed script — no furigana. You will read kanji compounds fluently as units of meaning rather than individual characters.' },
      { icon: '字', title: 'Kanji', desc: '366 new kanji added (650 total). Covers abstract concepts (意味 感情 関係), verbs of thinking and feeling (思 感 考), social contexts (社会 政治 経済), and more complex compound patterns.' },
      { icon: '語', title: 'Vocabulary', desc: '1,784 level-specific words. New additions: abstract nouns, connective adverbs (さらに、しかし、一方), polite speech variants, idiomatic phrases, and emotional vocabulary.' },
      { icon: '文', title: 'Grammar', desc: '113 new patterns. Key highlights: causative (〜させる), causative-passive (〜させられる), complex conjunctions (〜のに・〜ながら・〜ために), expressing degree, formal and written styles.' },
      { icon: '📖', title: 'Reading', desc: 'Multi-paragraph passages (200–400 characters) on practical topics: news articles, announcements, advertisements, informal letters. Tested on main point, detail, and author intent.' },
      { icon: '👂', title: 'Listening', desc: 'Full natural-speed conversations, announcements, and short presentations. Questions require inference, understanding of speaker relationship and purpose.' },
      { icon: '🎯', title: 'Practice', desc: 'Reading timed passages under test conditions. Listening to authentic material (NHK Web Easy, podcasts for learners). Writing paragraphs with complex grammar patterns. Peer conversation practice.' },
      { icon: '📋', title: 'Mock Tests', desc: 'N3 format: Language Knowledge (Vocabulary + Grammar + Text Comprehension), Listening. ~140 questions, 140 minutes. Aim for consistent 70%+ before advancing.' },
    ],
  },

  {
    code: 'N2', label: 'Upper-Intermediate', jp: '上中級',
    color: '#b45309', glow: '#fbbf2455', darkColor: '#92400e',
    status: 'upcoming', progress: 0, xp: 0,
    icon: '⛩️', emoji: '⛩️',

    overview: 'N2 represents a significant leap in complexity and is considered the professional benchmark in Japan. Companies, universities, and visa programs commonly require N2 as a minimum standard. You will study newspaper-level texts, formal writing styles, complex grammar, and understand lectures and broadcasts. N2 prepares you for working, studying, or living independently in Japan.',
    whoFor: 'Learners who have passed N3 with confidence and are prepared for an intensive academic-style study period.',
    studyHours: { min: 600, max: 1200, note: 'total study time; ~300–400 additional hours from N3' },

    stats: { kanji: 1017, vocab: 1793, grammar: 182 },
    readingLevel:   { label: 'Advanced',       score: 4, desc: 'Newspaper articles, formal documents, editorials. Complex sentence structures and abstract topics.' },
    listeningLevel: { label: 'Complex & Fast', score: 4, desc: 'Lectures, interviews, news broadcasts. Longer passages with implicit information.' },

    communication: [
      'Read and discuss newspaper articles',
      'Write formal documents and reports',
      'Participate in meetings and presentations',
      'Understand TV news and documentaries',
      'Engage in abstract discussions',
      'Navigate professional workplace settings',
    ],
    realWorld: [
      { icon: '🏢', label: 'Workplace communication' },
      { icon: '🎓', label: 'University study in Japan' },
      { icon: '📺', label: 'Watching news & documentaries' },
      { icon: '📝', label: 'Writing formal reports' },
      { icon: '🗣️', label: 'Presentations and meetings' },
    ],
    whatsNew: [
      'Formal written grammar: 〜にもかかわらず, 〜をはじめ, 〜に反して',
      'Nominalisation at advanced level: 〜にあたり, 〜に際して',
      'Business and keigo (honorific) expressions',
      'Complex conditional and concessive patterns',
      'Academic and editorial reading strategies',
      'Extended listening (5–10 minute passages)',
      'Inference from context and tone',
      'Collocations and fixed expressions common in written Japanese',
    ],
    skillsUnlocked: ['Professional-level communication', 'Read newspapers & editorials', 'Academic study in Japan', 'Understand broadcasts & lectures', 'Recognise 1,017 total kanji'],
    prerequisites: ['N3 completion with strong grammar foundation', 'Comfortable reading without furigana', 'Understanding of natural-speed speech', '3,078+ vocabulary words', 'Familiarity with formal Japanese registers'],

    curriculum: [
      { icon: '✍️', title: 'Writing System', desc: 'All 1,017 N1–N2 kanji are used freely. Focus on kanji used in formal and written contexts — legal, business, academic. Reading kanji-heavy newspaper text fluently.' },
      { icon: '字', title: 'Kanji', desc: '367 new kanji added (1,017 total). Includes business kanji (契約 報告 決定), academic vocabulary (研究 分析 理論), and complex compounds used in formal writing and newspapers.' },
      { icon: '語', title: 'Vocabulary', desc: '1,793 level-specific words. Heavy focus on formal vocabulary, business terms (プレゼン 会議 交渉), connective expressions for formal writing, and idiomatic phrases used in newspapers and broadcasts.' },
      { icon: '文', title: 'Grammar', desc: '182 new patterns with strong emphasis on formal written style: 〜にもかかわらず, 〜をはじめとして, 〜に反して, 〜をめぐって, 〜に伴い. Many patterns appear exclusively in written Japanese.' },
      { icon: '📖', title: 'Reading', desc: 'Long passages (400–600 characters): newspaper editorials, formal announcements, business emails, and academic-style writing. Questions test comprehension, inference, and vocabulary in context.' },
      { icon: '👂', title: 'Listening', desc: 'Extended audio (3–5 minutes): lectures, news, interviews, presentations. Questions require understanding of speaker stance, supporting arguments, and overall structure — not just facts.' },
      { icon: '🎯', title: 'Practice', desc: 'Daily newspaper reading (NHK News Web, Asahi Shimbun simplified). Summary writing in Japanese. Listening to NHK Radio news. Mock business role-plays. Intensive kanji compound study.' },
      { icon: '📋', title: 'Mock Tests', desc: 'N2 format: Language Knowledge (Vocabulary + Grammar + Comprehension), Listening. ~155 questions, 155 minutes. Target 75%+ consistently. N2 is a rigorous exam — allow ample preparation time.' },
    ],
  },

  {
    code: 'N1', label: 'Advanced', jp: '上級',
    color: '#be123c', glow: '#fb718555', darkColor: '#9f1239',
    status: 'upcoming', progress: 0, xp: 0,
    icon: '🏯', emoji: '🏯',

    overview: 'N1 is the pinnacle of the JLPT — the proof of near-native Japanese proficiency. It demands mastery of virtually all common kanji (2,136), an extensive vocabulary (3,463 level-specific words), and an understanding of literary, academic, and classical expressions. N1 holders can operate in any professional, academic, or social context in Japan without meaningful language barriers.',
    whoFor: 'Learners who have passed N2 and are committed to achieving near-native Japanese proficiency.',
    studyHours: { min: 900, max: 2000, note: 'total study time; 400–900+ additional hours from N2' },

    stats: { kanji: 2136, vocab: 3463, grammar: 212 },
    readingLevel:   { label: 'Near-Native',  score: 5, desc: 'Literature, academic papers, legal documents, complex editorials. Nuanced and implied meaning.' },
    listeningLevel: { label: 'Expert',        score: 5, desc: 'Any authentic Japanese audio — varied accents, fast speech, abstract topics, cultural nuance.' },

    communication: [
      'Read and write literary and academic Japanese',
      'Understand any TV programme, film, or podcast',
      'Participate in complex debates and discussions',
      'Write academic papers and formal reports',
      'Understand cultural nuance and humour',
      'Work in any professional environment in Japan',
    ],
    realWorld: [
      { icon: '📚', label: 'Reading novels & literature' },
      { icon: '🔬', label: 'Academic research in Japanese' },
      { icon: '⚖️', label: 'Legal and official documents' },
      { icon: '🎭', label: 'Appreciating comedy & culture' },
      { icon: '🌏', label: 'Any context in Japan' },
    ],
    whatsNew: [
      'Classical grammar elements (〜べき, 〜に他ならない, 〜に過ぎない)',
      'Literary and archaic expressions',
      'Highly formal written patterns found in academic papers',
      'Idiomatic four-character compounds (四字熟語)',
      'Understanding of regional accents and speech variations',
      'Nuanced reading for author intent, tone, and subtext',
      'Extended listening with abstract and culturally-specific content',
      'All Jōyō kanji (2,136) plus extended kanji set',
    ],
    skillsUnlocked: ['Near-native reading & listening', 'Any professional role in Japan', 'Academic study at Japanese universities', 'Fluent written Japanese in all registers', 'All 2,136 Jōyō kanji'],
    prerequisites: ['N2 completion', '4,871+ vocabulary words', 'Solid formal grammar and keigo', 'Regular exposure to authentic Japanese media', 'Consistent long-form reading and listening practice'],

    curriculum: [
      { icon: '✍️', title: 'Writing System', desc: 'All 2,136 Jōyō kanji plus extended characters used in names and literature. Classical kana usage (historical spelling), kanji-only readings in academic texts, and advanced compound patterns.' },
      { icon: '字', title: 'Kanji', desc: '1,119 new kanji added (2,136 total — the complete Jōyō set). Covers all domains: literary, legal, political, scientific, cultural, and classical. Many kanji have multiple readings used in specific contexts.' },
      { icon: '語', title: 'Vocabulary', desc: '3,463 level-specific words. Includes literary expressions, classical vocabulary, four-character idioms (四字熟語), technical terminology across multiple fields, and subtle distinctions between near-synonyms.' },
      { icon: '文', title: 'Grammar', desc: '212 advanced patterns including classical grammar (〜べきだ, 〜に他ならない, 〜に過ぎない, 〜に足る), highly formal written style patterns, and expressions unique to academic and literary contexts.' },
      { icon: '📖', title: 'Reading', desc: 'Long, complex passages (600–900+ characters): academic articles, literary excerpts, editorials, official documents. Tested on nuanced understanding, author intent, implicit meaning, and vocabulary in specialised contexts.' },
      { icon: '👂', title: 'Listening', desc: 'Extended authentic audio (5–10 minutes): academic lectures, complex interviews, debates, narrative storytelling. Varied speakers, registers, and speeds. Questions test inference, abstract comprehension, and speaker stance.' },
      { icon: '🎯', title: 'Practice', desc: 'Daily reading of Japanese novels, academic journals, and newspapers. Watching NHK documentaries and debates without subtitles. Writing essays in formal Japanese. Extensive four-character idiom and classical pattern study.' },
      { icon: '📋', title: 'Mock Tests', desc: 'N1 format: Language Knowledge (Vocabulary + Grammar + Comprehension), Listening. ~155 questions, 170 minutes. The hardest of all JLPT levels — aim for 70%+ (passing threshold is 100/180). Extensive preparation is essential.' },
    ],
  },
]

const FLOATING_KANJI = ['道', '旅', '学', '進', '夢', '力', '先', '歩', '高', '志']
const DIFF_LABELS = ['', 'Very Simple', 'Simple', 'Intermediate', 'Advanced', 'Near-Native']
const DIFF_COLORS = ['', '#059669', '#0284c7', '#7c3aed', '#b45309', '#be123c']

// ── Helper components ─────────────────────────────────────────────────────────

function DifficultyBar({ score, color }) {
  return (
    <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
      {[1, 2, 3, 4, 5].map(n => (
        <motion.div
          key={n}
          style={{ height: 6, width: 28, borderRadius: 999, background: n <= score ? color : 'rgba(0,0,0,0.08)' }}
          initial={{ scaleX: 0, originX: '0%' }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 0.1 + n * 0.07, duration: 0.35 }}
        />
      ))}
    </div>
  )
}

function ProgressRing({ progress, color, size = 68 }) {
  const r = (size - 10) / 2
  const circ = 2 * Math.PI * r
  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)', flexShrink: 0 }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(0,0,0,0.07)" strokeWidth={5} />
      <motion.circle
        cx={size / 2} cy={size / 2} r={r}
        fill="none" stroke={color} strokeWidth={5} strokeLinecap="round"
        strokeDasharray={circ}
        initial={{ strokeDashoffset: circ }}
        animate={{ strokeDashoffset: circ - (progress / 100) * circ }}
        transition={{ duration: 1.4, ease: 'easeOut', delay: 0.3 }}
      />
    </svg>
  )
}

function StatChip({ icon, label, value, color }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
      padding: '10px 14px', borderRadius: 14,
      background: `${color}0f`, border: `1px solid ${color}22`,
      minWidth: 70, textAlign: 'center',
    }}>
      <span style={{ fontSize: '1rem' }}>{icon}</span>
      <span style={{ fontSize: '1.1rem', fontWeight: 900, color }}>{value}</span>
      <span style={{ fontSize: '0.63rem', fontWeight: 700, color: 'var(--muted-plum)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</span>
    </div>
  )
}

// ── Level Card ────────────────────────────────────────────────────────────────

function LevelCard({ level, index, expanded, onToggle }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-50px' })
  const isLocked   = level.status === 'upcoming'
  const isCurrent  = level.status === 'current'
  const isComplete = level.status === 'complete'

  return (
    <div ref={ref} style={{ display: 'flex', alignItems: 'flex-start', position: 'relative', marginBottom: 4 }}>

      {/* Timeline node */}
      <div style={{ position: 'absolute', left: -44, top: 20, zIndex: 2 }}>
        {isCurrent && [1, 2].map(n => (
          <motion.div key={n} style={{ position: 'absolute', inset: -n * 9, borderRadius: '50%', border: `2px solid ${level.color}`, opacity: 0 }}
            animate={{ opacity: [0, 0.4, 0], scale: [0.8, 1.5, 1.9] }}
            transition={{ duration: 2.2, repeat: Infinity, delay: n * 0.7 }}
          />
        ))}
        <motion.div
          style={{
            width: 34, height: 34, borderRadius: '50%',
            background: isLocked ? 'rgba(180,180,180,0.15)' : `linear-gradient(135deg, ${level.color}, ${level.darkColor})`,
            border: `3px solid ${isLocked ? 'rgba(150,150,150,0.25)' : level.color}`,
            display: 'grid', placeItems: 'center', fontSize: '1rem',
            boxShadow: isLocked ? 'none' : `0 0 18px ${level.glow}`,
          }}
          initial={{ scale: 0, opacity: 0 }}
          animate={inView ? { scale: 1, opacity: 1 } : {}}
          transition={{ type: 'spring', stiffness: 260, delay: 0.1 }}
        >
          {isComplete ? '✓' : isLocked ? '🔒' : level.icon}
        </motion.div>
      </div>

      {/* Card */}
      <motion.div
        style={{ flex: 1, opacity: isLocked ? 0.65 : 1 }}
        initial={{ opacity: 0, x: index % 2 === 0 ? -32 : 32 }}
        animate={inView ? { opacity: isLocked ? 0.65 : 1, x: 0 } : {}}
        transition={{ duration: 0.5, ease: 'easeOut', delay: 0.08 }}
      >
        <div
          className="clay-card"
          onClick={onToggle}
          style={{
            cursor: 'pointer',
            borderLeft: `4px solid ${isLocked ? 'rgba(150,150,150,0.18)' : level.color}`,
            boxShadow: isCurrent ? `0 8px 36px ${level.glow}, 0 2px 8px rgba(0,0,0,0.05)` : undefined,
          }}
        >

          {/* ── Collapsed header (always visible) ── */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <ProgressRing progress={level.progress} color={level.color} />
              <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 900, color: isLocked ? 'var(--muted-plum)' : level.color }}>
                  {isLocked ? '—' : `${level.progress}%`}
                </span>
              </div>
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 5 }}>
                <span style={{ fontWeight: 900, fontSize: '1.6rem', color: isLocked ? 'var(--muted-plum)' : level.color, lineHeight: 1 }}>{level.code}</span>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '0.92rem', color: 'var(--dark-ink)' }}>{level.label}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--muted-plum)', fontWeight: 600 }}>{level.jp} · {level.studyHours.min}–{level.studyHours.max} hrs total</div>
                </div>
                {isCurrent && (
                  <motion.span
                    animate={{ opacity: [1, 0.55, 1] }}
                    transition={{ duration: 1.8, repeat: Infinity }}
                    style={{ fontSize: '0.68rem', fontWeight: 800, padding: '3px 10px', borderRadius: 999, background: `linear-gradient(135deg, ${level.color}, ${level.darkColor})`, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.06em' }}
                  >
                    ✦ You are here
                  </motion.span>
                )}
                {isComplete && <span style={{ fontSize: '0.68rem', fontWeight: 800, padding: '3px 10px', borderRadius: 999, background: 'rgba(5,150,105,0.12)', color: '#059669' }}>✓ Complete</span>}
                {isLocked   && <span style={{ fontSize: '0.68rem', fontWeight: 700, padding: '3px 10px', borderRadius: 999, background: 'rgba(0,0,0,0.05)', color: 'var(--muted-plum)' }}>🔒 Locked</span>}
              </div>

              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                {[
                  { k: '字', v: level.stats.kanji.toLocaleString(), l: 'Kanji' },
                  { k: '語', v: level.stats.vocab.toLocaleString(),  l: 'Vocab' },
                  { k: '文', v: level.stats.grammar,                 l: 'Grammar pts' },
                ].map(s => (
                  <div key={s.l} style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '0.95rem', fontWeight: 900, color: isLocked ? 'var(--muted-plum)' : level.color }}>{s.v}</div>
                    <div style={{ fontSize: '0.62rem', fontWeight: 700, color: 'var(--muted-plum)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.l}</div>
                  </div>
                ))}
              </div>
            </div>

            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--terracotta)', alignSelf: 'flex-start', flexShrink: 0, paddingTop: 4 }}>
              {expanded ? '▲' : '▼'}
            </span>
          </div>

          {!isLocked && (
            <div style={{ marginTop: 12 }}>
              <div className="progress-bar-wrap">
                <motion.div className="progress-bar-fill" style={{ background: `linear-gradient(90deg, ${level.color}, ${level.darkColor})` }}
                  initial={{ width: 0 }} animate={inView ? { width: `${level.progress}%` } : {}}
                  transition={{ duration: 1.3, ease: 'easeOut', delay: 0.35 }}
                />
              </div>
            </div>
          )}

          {/* ── Expanded detail ── */}
          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.38 }}
                style={{ overflow: 'hidden' }}
              >
                <hr className="divider" style={{ margin: '18px 0' }} />

                {/* Overview */}
                <div style={{ marginBottom: 20 }}>
                  <div className="eyebrow" style={{ marginBottom: 8 }}>Overview</div>
                  <p style={{ fontSize: '0.88rem', color: 'var(--dark-ink)', lineHeight: 1.75 }}>{level.overview}</p>
                  <div style={{ display: 'flex', gap: 10, marginTop: 12, flexWrap: 'wrap', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.78rem', fontWeight: 700, padding: '5px 14px', borderRadius: 999, background: `${level.color}15`, color: level.color, border: `1px solid ${level.color}30` }}>
                      👤 {level.whoFor}
                    </span>
                    <span style={{ fontSize: '0.78rem', fontWeight: 700, padding: '5px 14px', borderRadius: 999, background: 'rgba(0,0,0,0.04)', color: 'var(--dark-ink)', border: '1px solid rgba(0,0,0,0.08)' }}>
                      ⏱️ {level.studyHours.min}–{level.studyHours.max} hours {level.studyHours.note}
                    </span>
                  </div>
                </div>

                {/* Reading & Listening difficulty */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12, marginBottom: 20 }}>
                  {[
                    { label: 'Reading', data: level.readingLevel,   icon: '📖' },
                    { label: 'Listening', data: level.listeningLevel, icon: '👂' },
                  ].map(item => (
                    <div key={item.label} style={{ padding: '14px 16px', borderRadius: 14, background: `${level.color}08`, border: `1px solid ${level.color}1a` }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                        <span>{item.icon}</span>
                        <span style={{ fontWeight: 700, fontSize: '0.8rem', color: 'var(--dark-ink)' }}>{item.label}</span>
                        <span style={{ marginLeft: 'auto', fontSize: '0.72rem', fontWeight: 800, color: level.color }}>{item.data.label}</span>
                      </div>
                      <DifficultyBar score={item.data.score} color={level.color} />
                      <p style={{ fontSize: '0.78rem', color: 'var(--muted-plum)', marginTop: 8, lineHeight: 1.6 }}>{item.data.desc}</p>
                    </div>
                  ))}
                </div>

                {/* Communication skills */}
                <div style={{ marginBottom: 20 }}>
                  <div className="eyebrow" style={{ marginBottom: 10 }}>Communication Skills</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {level.communication.map((s, i) => (
                      <motion.span key={s} initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }}
                        style={{ fontSize: '0.78rem', fontWeight: 700, padding: '6px 12px', borderRadius: 999, background: `${level.color}12`, color: level.color, border: `1px solid ${level.color}25` }}>
                        ✦ {s}
                      </motion.span>
                    ))}
                  </div>
                </div>

                {/* Real-world scenarios */}
                <div style={{ marginBottom: 20 }}>
                  <div className="eyebrow" style={{ marginBottom: 10 }}>Real-World Use</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {level.realWorld.map((r, i) => (
                      <motion.div key={r.label} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                        style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8rem', fontWeight: 700, padding: '7px 13px', borderRadius: 12, background: 'rgba(255,255,255,0.7)', border: '1px solid rgba(0,0,0,0.06)', color: 'var(--dark-ink)' }}>
                        <span>{r.icon}</span>{r.label}
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* What's new */}
                <div style={{ marginBottom: 20 }}>
                  <div className="eyebrow" style={{ marginBottom: 10 }}>What's New at {level.code}</div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 6 }}>
                    {level.whatsNew.map((w, i) => (
                      <motion.div key={w} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                        style={{ display: 'flex', gap: 8, alignItems: 'flex-start', fontSize: '0.82rem', color: 'var(--dark-ink)', lineHeight: 1.5 }}>
                        <span style={{ width: 5, height: 5, borderRadius: '50%', background: level.color, flexShrink: 0, marginTop: 6 }} />
                        {w}
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Curriculum breakdown */}
                <div style={{ marginBottom: 20 }}>
                  <div className="eyebrow" style={{ marginBottom: 12 }}>Curriculum Breakdown</div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 10 }}>
                    {level.curriculum.map((c, i) => (
                      <motion.div key={c.title} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                        style={{ padding: '13px 15px', borderRadius: 14, background: `${level.color}07`, border: `1px solid ${level.color}18` }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 7 }}>
                          <span style={{ fontSize: '1.1rem' }}>{c.icon}</span>
                          <span style={{ fontWeight: 800, fontSize: '0.82rem', color: level.color }}>{c.title}</span>
                        </div>
                        <p style={{ fontSize: '0.78rem', color: 'var(--muted-plum)', lineHeight: 1.65, margin: 0 }}>{c.desc}</p>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Skills unlocked */}
                <div style={{ marginBottom: 20 }}>
                  <div className="eyebrow" style={{ marginBottom: 10 }}>Skills Unlocked After {level.code}</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {level.skillsUnlocked.map((s, i) => (
                      <motion.span key={s} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.06 }}
                        style={{ fontSize: '0.78rem', fontWeight: 700, padding: '5px 12px', borderRadius: 999, background: 'rgba(5,150,105,0.1)', color: '#059669', border: '1px solid rgba(5,150,105,0.2)' }}>
                        🏆 {s}
                      </motion.span>
                    ))}
                  </div>
                </div>

                {/* Prerequisites for next level */}
                <div style={{ marginBottom: 18 }}>
                  <div className="eyebrow" style={{ marginBottom: 10 }}>Before Moving to the Next Level</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                    {level.prerequisites.map((p, i) => (
                      <motion.div key={p} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                        style={{ display: 'flex', gap: 8, fontSize: '0.82rem', color: 'var(--dark-ink)', alignItems: 'flex-start', lineHeight: 1.55 }}>
                        <span style={{ color: level.color, fontWeight: 800, flexShrink: 0 }}>→</span>
                        {p}
                      </motion.div>
                    ))}
                  </div>
                </div>

                <Link to={level.ctaTo ?? `/levels/${level.code}`} className="primary-btn btn-sm"
                  style={{ background: `linear-gradient(135deg, ${level.color}, ${level.darkColor})`, display: 'inline-flex' }}
                  onClick={e => e.stopPropagation()}>
                  {isComplete ? `Review ${level.code}` : isCurrent ? `Continue ${level.code} ✦` : `Preview ${level.code}`} →
                </Link>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────

// LEVELS holds only static, descriptive curriculum content (overview, curriculum
// breakdown, prerequisites, etc.) — it is never a source of truth for a user's
// actual status/progress/counts. Those always come from /api/v1/roadmap. This
// neutral base is what renders before that first real fetch resolves, so no
// fabricated numbers are ever shown, even momentarily.
const NEUTRAL_LEVELS = LEVELS.map((l) => ({
  ...l, status: 'upcoming', progress: 0, current: false, stats: { kanji: 0, vocab: 0, grammar: 0 },
}))

export default function RoadmapPage() {
  const [expanded, setExpanded] = useState('N3')
  const [levels, setLevels] = useState(NEUTRAL_LEVELS)
  const [totalXp, setTotalXp] = useState(0)
  const [loadingLevels, setLoadingLevels] = useState(true)
  const [loadError, setLoadError] = useState('')

  // Derived purely from real (or neutral, pre-load) data — never from hardcoded content.
  const completedCount = levels.filter(l => l.status === 'complete').length
  const currentLevel   = levels.find(l => l.status === 'current')
  const overallPct     = Math.round(((completedCount * 100 + (currentLevel?.progress ?? 0)) / (levels.length * 100)) * 100)
  const totalKanji      = levels.reduce((s, l) => s + l.stats.kanji, 0)
  const totalVocab      = levels.reduce((s, l) => s + l.stats.vocab, 0)
  const totalGrammar    = levels.reduce((s, l) => s + l.stats.grammar, 0)

  function toggle(code) { setExpanded(p => p === code ? null : code) }

  useEffect(() => {
    let mounted = true
    async function fetchRoadmap() {
      setLoadingLevels(true)
      try {
        const { data } = await api.get('/api/v1/roadmap')
        if (!mounted) return
        // Merge real status/progress/stats onto the static curriculum content —
        // any level the API doesn't return (shouldn't happen) falls back to neutral.
        const merged = LEVELS.map((def) => {
          const real = data.levels?.find((n) => n.code === def.code)
          return real
            ? { ...def, status: real.status, progress: real.progress, current: real.current, stats: real.stats }
            : { ...def, status: 'upcoming', progress: 0, current: false, stats: { kanji: 0, vocab: 0, grammar: 0 } }
        })
        setLevels(merged)
        setTotalXp(data.totalXp ?? 0)
        setLoadError('')
      } catch (err) {
        console.error('Failed to load roadmap progress:', err)
        setLoadError('Unable to load your live progress right now.')
      } finally {
        if (mounted) setLoadingLevels(false)
      }
    }
    fetchRoadmap()
    return () => { mounted = false }
  }, [])

  return (
    <div className="page-shell" style={{ position: 'relative', overflow: 'hidden' }}>

      {/* Floating background kanji */}
      {FLOATING_KANJI.map((k, i) => (
        <motion.span key={k} aria-hidden="true"
          style={{
            position: 'fixed', pointerEvents: 'none', userSelect: 'none', zIndex: 0,
            top: `${6 + (i * 10) % 82}%`,
            left: i % 2 === 0 ? `${1 + (i * 7) % 8}%` : `${88 + (i * 3) % 10}%`,
            fontSize: `${3.5 + (i % 3) * 1.8}rem`, fontWeight: 900,
            color: 'var(--dark-ink)', opacity: 0.022,
          }}
          animate={{ y: [0, -20, 0], opacity: [0.022, 0.04, 0.022] }}
          transition={{ duration: 7 + i * 1.1, repeat: Infinity, delay: i * 0.6, ease: 'easeInOut' }}
        >
          {k}
        </motion.span>
      ))}

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <motion.div className="clay-card clay-card--lg"
        initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55 }}
        style={{ position: 'relative', overflow: 'hidden', zIndex: 1 }}
      >
        <motion.p className="eyebrow" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
          JLPT Learning Journey
        </motion.p>
        <motion.h1 className="page-title" style={{ marginTop: 8 }} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          Your JLPT Roadmap
        </motion.h1>
        <motion.p className="page-subtitle" style={{ marginTop: 10, maxWidth: 640 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
          A complete learning guide from your first hiragana (N5) to near-native mastery (N1). Each level is a structured milestone — tap to explore what you will study, what skills you will gain, and what you need before advancing.
        </motion.p>

        {/* Stats */}
        <motion.div style={{ display: 'flex', gap: 28, marginTop: 22, flexWrap: 'wrap' }}
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          {[
            { label: 'Levels Complete', val: `${completedCount} / 5`, color: '#059669' },
            { label: 'Current Level',   val: currentLevel?.code ?? '—', color: currentLevel?.color ?? 'var(--terracotta)' },
            { label: 'Journey Progress',val: `${overallPct}%`, color: '#7c3aed' },
            { label: 'XP Earned',       val: totalXp.toLocaleString(), color: '#b45309' },
          ].map(s => (
            <div key={s.label}>
              <div style={{ fontSize: '1.5rem', fontWeight: 900, color: s.color, lineHeight: 1 }}>{s.val}</div>
              <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--muted-plum)', textTransform: 'uppercase', letterSpacing: '0.07em', marginTop: 3 }}>{s.label}</div>
            </div>
          ))}
        </motion.div>

        {/* Overall progress bar */}
        <motion.div style={{ marginTop: 22 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--muted-plum)' }}>Overall journey · N5 → N1</span>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--terracotta)' }}>{overallPct}% complete</span>
          </div>
          <div className="progress-bar-wrap" style={{ height: 10, borderRadius: 999 }}>
            <motion.div style={{ height: '100%', borderRadius: 999, background: 'linear-gradient(90deg, #059669 0%, #0284c7 30%, #7c3aed 55%, #b45309 80%)' }}
              initial={{ width: 0 }} animate={{ width: `${overallPct}%` }}
              transition={{ duration: 1.6, ease: 'easeOut', delay: 0.7 }}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 7 }}>
            {levels.map(l => (
              <div key={l.code} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                <span style={{ fontSize: '0.68rem', fontWeight: 800, color: l.status === 'upcoming' ? 'var(--muted-plum)' : l.color }}>{l.code}</span>
                <span style={{ fontSize: '0.58rem', color: 'var(--muted-plum)' }}>{l.label}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Aggregate curriculum stats — summed from real per-level DB counts, not hardcoded */}
        <motion.div style={{ display: 'flex', gap: 10, marginTop: 20, flexWrap: 'wrap' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.75 }}>
          <StatChip icon="字" label="Total Kanji" value={totalKanji.toLocaleString()} color="#7c3aed" />
          <StatChip icon="語" label="Total Vocab" value={totalVocab.toLocaleString()} color="#0284c7" />
          <StatChip icon="文" label="Grammar Pts" value={totalGrammar.toLocaleString()} color="#b45309" />
          <StatChip icon="⏱️" label="Study Hours" value="900–2,000+" color="#059669" />
        </motion.div>

        <span style={{ position: 'absolute', right: 28, top: '50%', transform: 'translateY(-50%)', fontSize: '8rem', fontWeight: 900, color: 'rgba(201,122,74,0.045)', pointerEvents: 'none', userSelect: 'none' }}>道</span>
      </motion.div>

      {loadingLevels && (
        <div className="notice" style={{ background: 'rgba(0,0,0,0.04)', color: 'var(--muted-plum)', zIndex: 1, position: 'relative' }}>
          Loading your live progress…
        </div>
      )}
      {loadError && (
        <div className="notice" style={{ background: 'rgba(192,80,60,0.08)', color: '#c0503c', borderLeft: '3px solid #c0503c', zIndex: 1, position: 'relative' }}>
          {loadError}
        </div>
      )}

      {/* ── How to use this roadmap ────────────────────────────────────────── */}
      <motion.div
        className="notice notice-gold"
        initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5, duration: 0.4 }}
        style={{ zIndex: 1, position: 'relative' }}
      >
        <strong>How to use this roadmap</strong> — Tap any level card to expand its full curriculum, skills, real-world applications, and study guidance. Complete levels in order: N5 → N4 → N3 → N2 → N1. Each level builds directly on the previous one.
      </motion.div>

      {/* ── Timeline ─────────────────────────────────────────────────────── */}
      <div style={{ position: 'relative', paddingLeft: 56, zIndex: 1 }}>

        {/* Vertical line */}
        <motion.div
          style={{
            position: 'absolute', left: 17, top: 18, bottom: 18, width: 3, borderRadius: 999,
            background: 'linear-gradient(to bottom, #059669 0%, #0284c7 25%, #7c3aed 50%, rgba(180,83,9,0.4) 75%, rgba(190,18,60,0.2) 100%)',
          }}
          initial={{ scaleY: 0, originY: '0%' }}
          animate={{ scaleY: 1 }}
          transition={{ duration: 1.8, ease: [0.16, 1, 0.3, 1], delay: 0.4 }}
        />

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {levels.map((level, i) => (
            <LevelCard key={level.code} level={level} index={i} expanded={expanded === level.code} onToggle={() => toggle(level.code)} />
          ))}
        </div>
      </div>

      {/* ── Footer motivation ─────────────────────────────────────────────── */}
      <motion.div className="clay-card" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
        style={{ textAlign: 'center', zIndex: 1, position: 'relative' }}>
        <motion.div style={{ fontSize: '2.5rem', marginBottom: 10 }}
          animate={{ rotate: [0, 6, -6, 0] }} transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}>
          🗺️
        </motion.div>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--dark-ink)', marginBottom: 8 }}>
          Every expert was once a beginner
        </h2>
        <p style={{ color: 'var(--muted-plum)', fontSize: '0.88rem', lineHeight: 1.75, maxWidth: 500, margin: '0 auto 20px' }}>
          The path to N1 is long, but each kanji you learn, each grammar pattern you master, and each flashcard you review adds up.
          Your journey through N5 → N4 → N3 → N2 → N1 is a marathon — and you've already started.
        </p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to={`/levels/${currentLevel?.code ?? 'N5'}`} className="primary-btn">Continue Studying →</Link>
          <Link to="/flashcards" className="secondary-btn">SRS Review</Link>
          <Link to="/study-plan" className="ghost-btn">Study Plan</Link>
        </div>
      </motion.div>

    </div>
  )
}
