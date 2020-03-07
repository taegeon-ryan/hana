const { RTMClient } = require('@slack/rtm-api')
const school = require('./school')

const rtm = new RTMClient(process.env.slackbotToken)

rtm.on('member_joined_channel', async (event) => {
  const message = [
    `안녕, 친구들! <@${event.user}> 등장!`,
    `우린 당신을 기다리고 있었어요 <@${event.user}> 님`,
    `<@${event.user}> 님이 방금 서버에 참가하셨어요. 그럼 이제 게임을 즐겨보세요!`,
    `<@${event.user}> 님이 파티에 참가하셨어요.`,
    `저기요! 들어봐요! <@${event.user}> 님이 참가하셨어요!`,
    `<@${event.user}>님이 배틀 버스에 탑승했어요.`,
    `마음의 준비를 하세요. <@${event.user}> 님이 방금 서버에 참가하셨어요.`,
    `도전자 등장 - <@${event.user}> 님이 나타나셨어요!`,
    `<@${event.user}> 님이 어디로 가셨을까요? 이 서버에 있으시네요!`,
    `<@${event.user}> 님이 서버에 스폰하셨어요.`
  ]

  try {
    const random = Math.floor(Math.random() * message.length)
    const reply = await rtm.sendMessage(message[random], event.channel)
    console.log('Message sent successfully', reply.ts)
  } catch (error) {
    console.log('An error occurred', error)
  }
})

rtm.on('message', async (event) => {
  try {
    const info = await school(event.text)

    if (info) {
      const reply = await rtm.sendMessage(info, event.channel)
      console.log('Message sent successfully', reply.ts)
    }
  } catch (error) {
    console.log('An error occurred', error)
  }
});

(async () => {
  await rtm.start()
})()
