export const CULTURE_TOPICS = [
  { id: 'bowing', icon: '🙇', title: 'Bowing', fact: 'The deeper the bow, the more respect shown.', detail: 'A slight nod greets a friend; a deep 45° bow apologizes or shows deep respect. Bowing replaces handshakes in most everyday situations.' },
  { id: 'honorifics', icon: '🎩', title: 'Honorifics', fact: '-さん is the all-purpose "Mr./Ms."', detail: 'Names are almost never used bare. -さん (san) is neutral and safe; -ちゃん (chan) is for close friends/children; -様 (sama) is highly respectful, used for customers.' },
  { id: 'eating', icon: '🍚', title: 'Eating Etiquette', fact: 'Never stick chopsticks upright in rice.', detail: 'It resembles a funeral ritual. Say "いただきます" before eating and "ごちそうさまでした" after — both show gratitude for the meal.' },
  { id: 'temples', icon: '🛕', title: 'Temples', fact: 'Temples are Buddhist; shrines are Shinto.', detail: 'At a temple, you\'ll often see incense and statues of Buddha. Visitors bow quietly and may offer a small prayer.' },
  { id: 'shrines', icon: '⛩', title: 'Shrines', fact: 'Bow twice, clap twice, bow once.', detail: 'The classic Shinto shrine prayer sequence: two bows, two claps, a wish, then one final bow. Torii gates mark the entrance to sacred ground.' },
  { id: 'festivals', icon: '🎆', title: 'Festivals', fact: 'Summer means fireworks and yukata.', detail: 'Matsuri (festivals) fill summer nights with food stalls, taiko drums, and fireworks. Many people wear light cotton yukata robes.' },
  { id: 'trains', icon: '🚅', title: 'Trains', fact: 'Phone calls are a major faux pas.', detail: 'Trains are famously punctual and silent — phones go on silent mode, and calls are considered rude. Priority seats are reserved for elderly/pregnant/disabled riders.' },
  { id: 'convenience-stores', icon: '🏪', title: 'Convenience Stores', fact: 'Konbini can do almost anything.', detail: 'Japanese convenience stores (konbini) sell fresh meals, pay bills, print documents, and ship packages — open 24/7 on nearly every corner.' },
  { id: 'school-life', icon: '🎒', title: 'School Life', fact: 'Students clean their own classrooms.', detail: 'Japanese schools have no janitors for daily cleaning — students take turns sweeping, wiping desks, and cleaning bathrooms as part of their routine.' },
]

export const CULTURE_QUIZ = [
  { id: 'c1', prompt: 'What should you avoid doing with chopsticks?', choices: ['Holding them in one hand', 'Sticking them upright in rice', 'Using them for rice', 'Resting them on a rest'], correctIndex: 1, explanation: 'Sticking chopsticks upright in rice resembles a funeral ritual and should be avoided.' },
  { id: 'c2', prompt: 'What is the standard shrine prayer sequence?', choices: ['Clap once, bow once', 'Bow twice, clap twice, bow once', 'Bow once, clap four times', 'No bowing needed'], correctIndex: 1, explanation: 'Two bows, two claps, a silent wish, then one final bow — the classic Shinto sequence.' },
  { id: 'c3', prompt: 'Which honorific is the safe, neutral default for names?', choices: ['-ちゃん', '-様', '-さん', '-くん'], correctIndex: 2, explanation: '-さん (san) works politely in almost any situation, for anyone.' },
  { id: 'c4', prompt: 'What is generally considered rude on a Japanese train?', choices: ['Reading a book', 'Sleeping', 'Talking on the phone', 'Standing near the door'], correctIndex: 2, explanation: 'Phone calls are considered disruptive — most riders keep phones silent.' },
  { id: 'c5', prompt: 'What can you typically NOT do at a konbini (convenience store)?', choices: ['Pay a utility bill', 'Buy a fresh meal', 'Print a document', 'Get a haircut'], correctIndex: 3, explanation: 'Konbini are incredibly versatile, but haircuts are one of the few things they don\'t offer!' },
]
