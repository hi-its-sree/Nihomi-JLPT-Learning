export const FIRST_HIRAGANA = [
  { char: 'あ', romaji: 'a' },
  { char: 'い', romaji: 'i' },
  { char: 'う', romaji: 'u' },
  { char: 'え', romaji: 'e' },
  { char: 'お', romaji: 'o' },
  { char: 'か', romaji: 'ka' },
  { char: 'き', romaji: 'ki' },
  { char: 'く', romaji: 'ku' },
  { char: 'け', romaji: 'ke' },
  { char: 'こ', romaji: 'ko' },
]

export const HIRAGANA_MATCH_PAIRS = FIRST_HIRAGANA.map((h) => ({ id: h.char, left: h.char, right: h.romaji }))

export const HIRAGANA_QUIZ = [
  { id: 'h1', prompt: 'Which hiragana reads as "ka"?', choices: ['あ', 'か', 'く', 'こ'], correctIndex: 1, explanation: 'か is "ka" — note the similarity to き(ki)、く(ku)、け(ke)、こ(ko), the "k" row.' },
  { id: 'h2', prompt: 'What does う read as?', choices: ['e', 'o', 'u', 'i'], correctIndex: 2, explanation: 'う reads as "u", like the "oo" in "food".' },
  { id: 'h3', prompt: 'Which hiragana reads as "ko"?', choices: ['く', 'け', 'こ', 'き'], correctIndex: 2, explanation: 'こ is "ko" — the fifth character in the "k" row.' },
  { id: 'h4', prompt: 'What does え read as?', choices: ['a', 'i', 'u', 'e'], correctIndex: 3, explanation: 'え reads as "e", like the "e" in "bed".' },
  { id: 'h5', prompt: 'Which hiragana reads as "ki"?', choices: ['き', 'け', 'か', 'く'], correctIndex: 0, explanation: 'き is "ki" — as in the second half of "kimono".' },
]
