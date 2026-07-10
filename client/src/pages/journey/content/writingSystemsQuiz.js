export const WRITING_SYSTEMS = [
  {
    id: 'hiragana', color: '#db2777', example: 'こんにちは', label: 'Hello',
    front: 'ひらがな', back: 'Hiragana is Japan\'s native phonetic script — soft, curved shapes used for grammar (particles, verb endings) and native Japanese words. It\'s the first script every learner masters.',
  },
  {
    id: 'katakana', color: '#7c3aed', example: 'ラーメン', label: 'Ramen',
    front: 'カタカナ', back: 'Katakana shares the same sounds as hiragana but with sharp, angular shapes. It\'s used for foreign loanwords, brand names, and emphasis — like italics in English.',
  },
  {
    id: 'kanji', color: '#b45309', example: '日本', label: 'Japan',
    front: '漢字', back: 'Kanji are meaning-based characters borrowed from Chinese centuries ago. Each one carries meaning, not just sound — 日 means "sun/day," 本 means "origin," together "Japan."',
  },
]

export const WRITING_SYSTEMS_QUIZ = [
  {
    id: 'q1', prompt: 'Which script is こんにちは (hello) written in?',
    choices: ['Hiragana', 'Katakana', 'Kanji'], correctIndex: 0,
    explanation: 'こんにちは uses hiragana — Japan\'s native phonetic script for everyday grammar and words.',
  },
  {
    id: 'q2', prompt: 'Which script is ラーメン (ramen) written in?',
    choices: ['Hiragana', 'Katakana', 'Kanji'], correctIndex: 1,
    explanation: 'Katakana is used for loanwords — ラーメン is written in katakana even though ramen culture is deeply Japanese today.',
  },
  {
    id: 'q3', prompt: 'Which script is 日本 (Japan) written in?',
    choices: ['Hiragana', 'Katakana', 'Kanji'], correctIndex: 2,
    explanation: '日本 uses kanji — meaning-based characters. 日 (sun/day) + 本 (origin) = "origin of the sun," Japan.',
  },
  {
    id: 'q4', prompt: 'Which script has soft, curved shapes and handles native grammar like particles and verb endings?',
    choices: ['Hiragana', 'Katakana', 'Kanji'], correctIndex: 0,
    explanation: 'Hiragana\'s flowing shapes make it easy to spot — it glues sentences together grammatically.',
  },
  {
    id: 'q5', prompt: 'Which script is mainly used for foreign words and emphasis, similar to italics in English?',
    choices: ['Hiragana', 'Katakana', 'Kanji'], correctIndex: 1,
    explanation: 'Katakana\'s sharp, angular strokes make foreign words and emphasis instantly recognizable on a page.',
  },
]
