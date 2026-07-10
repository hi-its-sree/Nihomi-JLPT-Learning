export default {
  id: 'ordering-food', title: 'Ordering Food', icon: '🍜',
  characters: { player: { name: 'You', avatar: '🧑' }, npc: { name: 'Waiter', avatar: '🧑‍🍳' } },
  startNode: 'start', xpReward: 20,
  nodes: {
    start: {
      speaker: 'npc', text: 'いらっしゃいませ！ご注文は？', translation: '"Welcome! What would you like to order?"',
      choices: [
        { text: 'ラーメンを一つお願いします。', correct: true, next: 'n2', feedback: '"〜を一つお願いします" ("One ___, please") is a clean, natural order.' },
        { text: 'ありがとうございました。', correct: false, next: 'n2', feedback: 'That means "thank you very much" — usually said when leaving, not ordering.' },
      ],
    },
    n2: {
      speaker: 'npc', text: 'お飲み物はいかがですか？', translation: '"Would you like something to drink?"',
      choices: [
        { text: '水をください。', correct: true, next: 'n3', feedback: '"〜をください" ("___, please") works perfectly for ordering a drink.' },
        { text: 'すみません、トイレはどこですか？', correct: false, next: 'n3', feedback: 'That asks where the restroom is — reasonable to ask sometime, but not an answer to the drink question.' },
      ],
    },
    n3: {
      speaker: 'npc', text: 'かしこまりました。少々お待ちください。', translation: '"Understood. Please wait a moment."',
      choices: [
        { text: 'ありがとうございます。', correct: true, next: 'end', feedback: 'A simple, polite thank-you — exactly right here.' },
        { text: 'いくらですか？', correct: false, next: 'end', feedback: '"How much is it?" is a fine question, but it doesn\'t quite fit right after they say "please wait."' },
      ],
    },
    end: { speaker: 'npc', text: 'お待たせしました。どうぞ！', translation: '"Sorry for the wait. Here you go!"', end: true },
  },
}
