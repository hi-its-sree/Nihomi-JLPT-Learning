export default {
  id: 'shopping', title: 'Shopping', icon: '🛍️',
  characters: { player: { name: 'You', avatar: '🧑' }, npc: { name: 'Shop Clerk', avatar: '🧑‍💼' } },
  startNode: 'start', xpReward: 20,
  nodes: {
    start: {
      speaker: 'npc', text: 'いらっしゃいませ！何かお探しですか？', translation: '"Welcome! Are you looking for something?"',
      choices: [
        { text: 'このTシャツはいくらですか？', correct: true, next: 'n2', feedback: '"〜はいくらですか" ("How much is ___?") is exactly how to ask a price.' },
        { text: 'おはようございます。', correct: false, next: 'n2', feedback: '"Good morning" is a fine greeting, but doesn\'t answer what they\'re asking.' },
      ],
    },
    n2: {
      speaker: 'npc', text: '2,000円です。サイズはいかがですか？', translation: '"It\'s 2,000 yen. What about the size?"',
      choices: [
        { text: 'Mサイズをお願いします。', correct: true, next: 'n3', feedback: '"M size, please" — clean and clear.' },
        { text: '駅までお願いします。', correct: false, next: 'n3', feedback: 'That means "to the station, please" — useful for a taxi, not a clothing size!' },
      ],
    },
    n3: {
      speaker: 'npc', text: 'かしこまりました。お支払いは現金ですか、カードですか？', translation: '"Understood. Will you pay by cash or card?"',
      choices: [
        { text: 'カードでお願いします。', correct: true, next: 'end', feedback: '"By card, please" — directly answers the question.' },
        { text: 'おいしいです。', correct: false, next: 'end', feedback: 'That means "it\'s delicious" — probably meant for food, not payment method!' },
      ],
    },
    end: { speaker: 'npc', text: 'ありがとうございました！またお越しください。', translation: '"Thank you! Please come again."', end: true },
  },
}
