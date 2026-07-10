export default {
  id: 'asking-directions', title: 'Asking Directions', icon: '🗺️',
  characters: { player: { name: 'You', avatar: '🧑' }, npc: { name: 'Passerby', avatar: '🚶' } },
  startNode: 'start', xpReward: 20,
  nodes: {
    start: {
      speaker: 'player', text: 'すみません、駅はどこですか？', translation: '"Excuse me, where is the station?"',
      choices: [
        { text: '(Wait for their answer)', correct: true, next: 'n2', feedback: 'Good — you asked clearly using "〜はどこですか" ("Where is ___?").' },
      ],
    },
    n2: {
      speaker: 'npc', text: 'まっすぐ行って、右に曲がってください。', translation: '"Go straight, then turn right."',
      choices: [
        { text: 'まっすぐ、それから右ですね。ありがとうございます。', correct: true, next: 'n3', feedback: 'Repeating directions back to confirm is a very natural, polite habit in Japanese.' },
        { text: 'いくらですか？', correct: false, next: 'n3', feedback: '"How much is it?" doesn\'t fit — they just gave you directions, not a price.' },
      ],
    },
    n3: {
      speaker: 'npc', text: '駅まで五分ぐらいです。', translation: '"It\'s about five minutes to the station."',
      choices: [
        { text: 'わかりました。どうもありがとうございました。', correct: true, next: 'end', feedback: '"Understood, thank you very much" — a warm, appropriate close to the exchange.' },
        { text: 'はじめまして。', correct: false, next: 'end', feedback: '"Nice to meet you" is for the start of an introduction, not the end of asking directions.' },
      ],
    },
    end: { speaker: 'npc', text: '気をつけて！', translation: '"Take care!"', end: true },
  },
}
