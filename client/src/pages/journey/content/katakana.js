export const FIRST_KATAKANA = [
  { char: 'ア', romaji: 'a' },
  { char: 'イ', romaji: 'i' },
  { char: 'ウ', romaji: 'u' },
  { char: 'エ', romaji: 'e' },
  { char: 'オ', romaji: 'o' },
  { char: 'カ', romaji: 'ka' },
  { char: 'キ', romaji: 'ki' },
  { char: 'ク', romaji: 'ku' },
  { char: 'ケ', romaji: 'ke' },
  { char: 'コ', romaji: 'ko' },
]

export const KATAKANA_MATCH_PAIRS = FIRST_KATAKANA.map((k) => ({ id: k.char, left: k.char, right: k.romaji }))

export const LOANWORDS = [
  { word: 'コーヒー', romaji: 'koohii', meaning: 'Coffee' },
  { word: 'ホテル', romaji: 'hoteru', meaning: 'Hotel' },
  { word: 'ピザ', romaji: 'piza', meaning: 'Pizza' },
  { word: 'タクシー', romaji: 'takushii', meaning: 'Taxi' },
  { word: 'カメラ', romaji: 'kamera', meaning: 'Camera' },
]

export const KATAKANA_QUIZ = [
  { id: 'k1', prompt: 'Which katakana reads as "ka"?', choices: ['ア', 'カ', 'ク', 'コ'], correctIndex: 1, explanation: 'カ is "ka" — the katakana counterpart of hiragana か.' },
  { id: 'k2', prompt: 'What does コーヒー mean?', choices: ['Hotel', 'Coffee', 'Pizza', 'Taxi'], correctIndex: 1, explanation: 'コーヒー (koohii) is "coffee" — the long dash ー stretches the "o" sound.' },
  { id: 'k3', prompt: 'Which katakana reads as "ko"?', choices: ['ク', 'ケ', 'コ', 'キ'], correctIndex: 2, explanation: 'コ is "ko" — notice how similar its shape is to hiragana こ.' },
  { id: 'k4', prompt: 'What does ホテル mean?', choices: ['Camera', 'Taxi', 'Hotel', 'Coffee'], correctIndex: 2, explanation: 'ホテル (hoteru) is a direct borrowing of the English word "hotel".' },
  { id: 'k5', prompt: 'Katakana is mainly used for...', choices: ['Verb endings', 'Foreign loanwords', 'Numbers only', 'Family names only'], correctIndex: 1, explanation: 'Katakana spells out words borrowed from other languages, like コーヒー, ホテル, and ピザ.' },
]
