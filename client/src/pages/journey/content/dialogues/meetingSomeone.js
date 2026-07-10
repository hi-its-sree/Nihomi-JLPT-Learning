export default {
  id: 'meeting-someone', title: 'Meeting Someone New', icon: '🤝',
  characters: { player: { name: 'You', avatar: '🧑' }, npc: { name: 'Tanaka-san', avatar: '👤' } },
  startNode: 'start', xpReward: 20,
  nodes: {
    start: {
      speaker: 'npc', text: 'はじめまして。田中です。', translation: '"Nice to meet you. I\'m Tanaka."',
      choices: [
        { text: 'はじめまして。よろしくお願いします。', correct: true, next: 'n2', feedback: 'Perfect — a classic, polite first-meeting greeting.' },
        { text: 'こんばんは！', correct: false, next: 'n2', feedback: '"Konbanwa" means "good evening" — not the right greeting for a first introduction.' },
      ],
    },
    n2: {
      speaker: 'npc', text: 'お名前は何ですか？', translation: '"What is your name?"',
      choices: [
        { text: '私の名前は〇〇です。', correct: true, next: 'end', feedback: '"Watashi no namae wa ___ desu" — the standard way to state your name.' },
        { text: '元気です。', correct: false, next: 'end', feedback: '"Genki desu" means "I\'m doing well" — that answers a different question.' },
      ],
    },
    end: { speaker: 'npc', text: 'よろしくお願いします！', translation: '"Nice to meet you too — let\'s get along well!"', end: true },
  },
}
