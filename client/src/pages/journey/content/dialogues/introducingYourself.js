export default {
  id: 'introducing-yourself', title: 'Introducing Yourself', icon: '🙋',
  characters: { player: { name: 'You', avatar: '🧑' }, npc: { name: 'Classmates', avatar: '👥' } },
  startNode: 'start', xpReward: 20,
  nodes: {
    start: {
      speaker: 'npc', text: 'では、自己紹介をお願いします。', translation: '"Okay, please introduce yourself."',
      choices: [
        { text: 'はじめまして。〇〇と申します。', correct: true, next: 'n2', feedback: '"〜と申します" is a humble, polite way to say your name in formal settings.' },
        { text: 'ラーメンが好きです。', correct: false, next: 'n2', feedback: 'That means "I like ramen" — true, maybe, but not how you start an introduction!' },
      ],
    },
    n2: {
      speaker: 'npc', text: 'ご出身はどちらですか？', translation: '"Where are you from?"',
      choices: [
        { text: 'アメリカから来ました。', correct: true, next: 'n3', feedback: '"〜から来ました" ("I came from ___") is exactly how to answer this.' },
        { text: '駅はあちらです。', correct: false, next: 'n3', feedback: 'That means "the station is over there" — not related to where you\'re from.' },
      ],
    },
    n3: {
      speaker: 'npc', text: '趣味は何ですか？', translation: '"What are your hobbies?"',
      choices: [
        { text: '趣味は日本語の勉強です。', correct: true, next: 'end', feedback: '"My hobby is studying Japanese" — a perfectly natural, on-topic answer.' },
        { text: 'さようなら。', correct: false, next: 'end', feedback: 'That means "goodbye" — a bit sudden for the middle of a conversation!' },
      ],
    },
    end: { speaker: 'npc', text: 'いいですね！よろしくお願いします。', translation: '"Nice! Let\'s get along well."', end: true },
  },
}
