export default {
  id: 'hotel-check-in', title: 'Hotel Check-In', icon: '🏨',
  characters: { player: { name: 'You', avatar: '🧑' }, npc: { name: 'Front Desk', avatar: '💁' } },
  startNode: 'start', xpReward: 20,
  nodes: {
    start: {
      speaker: 'npc', text: 'いらっしゃいませ。チェックインですか？', translation: '"Welcome. Are you checking in?"',
      choices: [
        { text: 'はい、予約しています。〇〇です。', correct: true, next: 'n2', feedback: '"予約しています" ("I have a reservation") plus your name is exactly what\'s expected here.' },
        { text: 'いいえ、結構です。', correct: false, next: 'n2', feedback: '"No, that\'s okay" would end the conversation — not what you want when you\'re actually checking in!' },
      ],
    },
    n2: {
      speaker: 'npc', text: 'パスポートをお願いします。', translation: '"Your passport, please."',
      choices: [
        { text: 'はい、どうぞ。', correct: true, next: 'n3', feedback: '"Here you go" while handing something over — simple and correct.' },
        { text: '何時ですか？', correct: false, next: 'n3', feedback: '"What time is it?" doesn\'t answer their request for your passport.' },
      ],
    },
    n3: {
      speaker: 'npc', text: 'お部屋は305号室です。朝食は7時からです。', translation: '"Your room is 305. Breakfast starts at 7."',
      choices: [
        { text: 'ありがとうございます。エレベーターはどちらですか？', correct: true, next: 'end', feedback: 'Thanking them and asking a natural follow-up question — great flow.' },
        { text: 'さようなら。', correct: false, next: 'end', feedback: '"Goodbye" is a bit abrupt — you\'ve only just arrived at the hotel!' },
      ],
    },
    end: { speaker: 'npc', text: 'あちらです。ごゆっくりどうぞ。', translation: '"Over there. Please enjoy your stay."', end: true },
  },
}
