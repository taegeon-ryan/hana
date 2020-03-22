const { RTMClient } = require('@slack/rtm-api')
const school = require('./school')
const fs = require('fs')
const message = JSON.parse(fs.readFileSync('src/message.json').toString())

const rtm = new RTMClient(process.env.slackbotToken)

rtm.on('member_joined_channel', async (event) => {
  const msg = []
  message.joined.forEach(element => {
    msg.push(element.replace('${event.user}', `${event.user}`))
  })

  try {
    const random = Math.floor(Math.random() * msg.length)
    const reply = await rtm.sendMessage(msg[random], event.channel)
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
