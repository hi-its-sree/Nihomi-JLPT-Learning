export default {
  id: 'visiting-station', title: 'Visiting a Station', icon: '🚉',
  characters: { player: { name: 'You', avatar: '🧑' }, npc: { name: 'Station Staff', avatar: '👮' } },
  startNode: 'start', xpReward: 20,
  nodes: {
    start: {
      speaker: 'player', text: 'すみません、新宿行きの電車はどのホームですか？', translation: '"Excuse me, which platform is the train to Shinjuku?"',
      choices: [
        { text: '(Wait for their answer)', correct: true, next: 'n2', feedback: '"〜行きの電車" ("the train bound for ___") is exactly how to ask about a destination train.' },
      ],
    },
    n2: {
      speaker: 'npc', text: '3番線です。', translation: '"Platform 3."',
      choices: [
        { text: '3番線ですね、ありがとうございます。', correct: true, next: 'n3', feedback: 'Repeating the platform number back confirms you understood correctly.' },
        { text: 'おなかがすきました。', correct: false, next: 'n3', feedback: '"I\'m hungry" — true perhaps, but unrelated to finding your platform!' },
      ],
    },
    n3: {
      speaker: 'npc', text: '次の電車は5分後に来ます。', translation: '"The next train comes in 5 minutes."',
      choices: [
        { text: 'わかりました。助かりました。', correct: true, next: 'end', feedback: '"Understood, that helped a lot" — a natural way to express thanks for the info.' },
        { text: 'これはいくらですか？', correct: false, next: 'end', feedback: 'Asking a price doesn\'t fit here — there\'s nothing being bought in this conversation.' },
      ],
    },
    end: { speaker: 'npc', text: 'いってらっしゃい！', translation: '"Have a safe trip!"', end: true },
  },
}
