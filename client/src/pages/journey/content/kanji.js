export const FIRST_KANJI = [
  { char: '日', meaning: 'sun / day', onyomi: 'ニチ・ジツ', kunyomi: 'ひ・か', strokeCount: 4, mnemonic: 'A square with a line through it — picture a simplified sun with a ray of light crossing it.' },
  { char: '人', meaning: 'person', onyomi: 'ジン・ニン', kunyomi: 'ひと', strokeCount: 2, mnemonic: 'Two strokes leaning on each other like a pair of legs walking — a person in motion.' },
  { char: '山', meaning: 'mountain', onyomi: 'サン', kunyomi: 'やま', strokeCount: 3, mnemonic: 'Three peaks side by side — it literally looks like a little mountain range.' },
  { char: '水', meaning: 'water', onyomi: 'スイ', kunyomi: 'みず', strokeCount: 4, mnemonic: 'A central stream of water with droplets splashing off to each side.' },
  { char: '学', meaning: 'study / learning', onyomi: 'ガク', kunyomi: 'まな(ぶ)', strokeCount: 8, mnemonic: 'A child under a roof of knowledge — a student soaking up new ideas.' },
]

export const KANJI_QUIZ = [
  { id: 'kj1', prompt: 'Which kanji means "mountain"?', choices: ['日', '人', '山', '水'], correctIndex: 2, explanation: '山 looks like three peaks — mountain.' },
  { id: 'kj2', prompt: 'What does 人 mean?', choices: ['Sun', 'Person', 'Water', 'Study'], correctIndex: 1, explanation: '人 is "person" — two strokes like a pair of legs walking.' },
  { id: 'kj3', prompt: 'How many strokes does 水 (water) have?', choices: ['2', '3', '4', '8'], correctIndex: 2, explanation: '水 is written in 4 strokes — a central stream with two droplets.' },
  { id: 'kj4', prompt: 'Which kanji means "sun / day"?', choices: ['日', '山', '学', '人'], correctIndex: 0, explanation: '日 is a square with a line through it — the sun.' },
  { id: 'kj5', prompt: 'Which kanji means "study / learning"?', choices: ['水', '人', '学', '日'], correctIndex: 2, explanation: '学 shows a child under a roof of knowledge — study.' },
]
