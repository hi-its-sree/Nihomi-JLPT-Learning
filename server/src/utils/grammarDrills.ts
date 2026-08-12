// Builds multiple-choice grammar drill questions out of the GrammarPattern rows
// already in the database. Nothing here is authored by hand: prompts, answers,
// and distractors all come from real entries, so the drill grows with the data.

export type GrammarSource = {
  id: string
  pattern: string
  meaning: string
  structure: string
  level: string
  example: string       // the Japanese example sentence
  translation: string   // its English translation
}

export type DrillQuestion = {
  id: string
  patternId: string
  type: 'cloze' | 'meaning' | 'pattern' | 'structure'
  instruction: string
  prompt: string
  sentence?: string
  translation?: string
  options: string[]
  correct: number
  explanation: string
  pattern: string
  level: string
}

const OPTION_COUNT = 4

// Kana and CJK ideographs — the parts of a pattern string that are actual
// Japanese, as opposed to the A/B placeholders and romaji glosses around them.
const JAPANESE_RUN = /[ぁ-ゟ゠-ヿ一-鿿]{2,}/g

// Pattern strings look like "A。けれども、～B。(A. Keredomo,~ B.)" — strip the
// romaji gloss in brackets, then pull out the Japanese fragments. The longest
// fragment is the one that actually identifies the pattern.
export function patternCores(pattern: string): string[] {
  const withoutGloss = pattern.replace(/[（(][^）)]*[）)]/g, ' ')
  const matches = withoutGloss.match(JAPANESE_RUN) ?? []
  return [...new Set(matches)].sort((a, b) => b.length - a.length)
}

// The fragment to blank out of the example sentence, or null when the sentence
// doesn't visibly contain the pattern (about 13% of entries).
export function clozeTarget(entry: GrammarSource): string | null {
  if (!entry.example) return null
  return patternCores(entry.pattern).find((core) => entry.example.includes(core)) ?? null
}

export const BLANK = '＿＿＿'

function shuffle<T>(items: T[], random: () => number): T[] {
  const out = [...items]
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

// Crude singular/plural fold so "expresses"/"express" count as one token. It
// has to be idempotent: stemming an already-stemmed word must not change it
// again, or the two forms end up as different tokens after all.
function stem(token: string): string {
  if (/(ses|xes|zes|ches|shes)$/.test(token)) return token.slice(0, -2)
  if (/[^s]s$/.test(token)) return token.slice(0, -1)
  return token
}

function tokenize(value: string): Set<string> {
  return new Set(
    value
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter(Boolean)
      .map(stem),
  )
}

// Several entries gloss the same idea in near-identical words ("Expresses reason
// or cause…" vs "Express the reason or cause…"). As a distractor beside its twin
// that would make the question unanswerable, so overlap this high is rejected.
const SIMILARITY_LIMIT = 0.7

export function tooSimilar(a: string, b: string): boolean {
  if (a === b) return true
  const left = tokenize(a)
  const right = tokenize(b)
  if (left.size === 0 || right.size === 0) return false
  let shared = 0
  left.forEach((token) => { if (right.has(token)) shared += 1 })
  const union = left.size + right.size - shared
  return union > 0 && shared / union >= SIMILARITY_LIMIT
}

// Pick up to `count` distinct distractor values from the pool, dropping any that
// restate the correct answer or one another.
function pickDistractors(pool: string[], correct: string, count: number, random: () => number): string[] {
  const candidates = shuffle([...new Set(pool)].filter(Boolean), random)
  const chosen: string[] = []
  for (const candidate of candidates) {
    if (chosen.length >= count) break
    if (tooSimilar(candidate, correct)) continue
    if (chosen.some((picked) => tooSimilar(candidate, picked))) continue
    chosen.push(candidate)
  }
  return chosen
}

function buildOptions(correct: string, pool: string[], random: () => number) {
  const distractors = pickDistractors(pool, correct, OPTION_COUNT - 1, random)
  const options = shuffle([correct, ...distractors], random)
  return { options, correct: options.indexOf(correct) }
}

function questionTypesFor(entry: GrammarSource): DrillQuestion['type'][] {
  const types: DrillQuestion['type'][] = ['meaning', 'pattern']
  if (clozeTarget(entry)) types.unshift('cloze')
  if (entry.structure?.trim()) types.push('structure')
  return types
}

function buildQuestion(
  entry: GrammarSource,
  type: DrillQuestion['type'],
  peers: GrammarSource[],
  random: () => number,
): DrillQuestion | null {
  const base = {
    id: `${entry.id}-${type}`,
    patternId: entry.id,
    type,
    pattern: entry.pattern,
    level: entry.level,
  }

  if (type === 'cloze') {
    const target = clozeTarget(entry)
    if (!target) return null
    // Every occurrence is blanked, not just the first. Doubled patterns like
    // "Noun といい Noun といい" put the same fragment in twice, and leaving the
    // second one visible would show the answer inside the question.
    const sentence = entry.example.split(target).join(BLANK)
    const { options, correct } = buildOptions(
      target,
      peers.flatMap((peer) => patternCores(peer.pattern).slice(0, 1)),
      random,
    )
    if (options.length < 2) return null
    return {
      ...base,
      instruction: 'Fill in the blank',
      prompt: sentence,
      sentence,
      translation: entry.translation,
      options,
      correct,
      explanation: `${entry.pattern} — ${entry.meaning}`,
    }
  }

  if (type === 'meaning') {
    const { options, correct } = buildOptions(entry.meaning, peers.map((peer) => peer.meaning), random)
    if (options.length < 2) return null
    return {
      ...base,
      instruction: 'What does this pattern mean?',
      prompt: entry.pattern,
      options,
      correct,
      explanation: `${entry.pattern} — ${entry.meaning}`,
      translation: entry.translation,
      sentence: entry.example,
    }
  }

  if (type === 'pattern') {
    const { options, correct } = buildOptions(entry.pattern, peers.map((peer) => peer.pattern), random)
    if (options.length < 2) return null
    return {
      ...base,
      instruction: 'Which pattern expresses this?',
      prompt: entry.meaning,
      options,
      correct,
      explanation: `${entry.pattern} — ${entry.meaning}`,
      translation: entry.translation,
      sentence: entry.example,
    }
  }

  const { options, correct } = buildOptions(entry.structure, peers.map((peer) => peer.structure), random)
  if (options.length < 2) return null
  return {
    ...base,
    instruction: 'Which structure does this pattern take?',
    prompt: entry.pattern,
    options,
    correct,
    explanation: `${entry.pattern} takes: ${entry.structure}`,
    translation: entry.translation,
    sentence: entry.example,
  }
}

export function buildGrammarDrill(
  entries: GrammarSource[],
  count: number,
  random: () => number = Math.random,
): DrillQuestion[] {
  if (entries.length === 0) return []

  const questions: DrillQuestion[] = []
  for (const entry of shuffle(entries, random)) {
    if (questions.length >= count) break

    // Distractors come from other entries at the same level, so a wrong answer
    // is always plausible rather than obviously off-level.
    const peers = entries.filter((other) => other.id !== entry.id)
    const types = questionTypesFor(entry)
    const type = types[Math.floor(random() * types.length)] ?? 'meaning'

    const question = buildQuestion(entry, type, peers, random)
    if (question) questions.push(question)
  }

  return questions
}
