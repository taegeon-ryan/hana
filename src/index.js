const { RTMClient } = require('@slack/rtm-api')
const Discord = require('discord.js');
const school = require('./school')
const fs = require('fs')
const message = JSON.parse(fs.readFileSync('src/message.json').toString())

const slack = new RTMClient(process.env.slackToken)
const discord = new Discord.Client();

if (process.env.discordToken) {
  discord.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
  });
  
  discord.on('message', msg => {
    if (msg.content === 'ping') {
      msg.reply('Pong!');
    }
  });

  discord.login(process.env.discordToken);
}

if (process.env.slackToken) {
  slack.on('member_joined_channel', async (event) => {
    const msg = []
    message.joined.forEach(element => {
      msg.push(element.replace('${event.user}', `${event.user}`))
    })
  
    try {
      const random = Math.floor(Math.random() * msg.length)
      const reply = await slack.sendMessage(msg[random], event.channel)
      console.log('Message sent successfully', reply.ts)
    } catch (error) {
      console.log('An error occurred', error)
    }
  })
  
  slack.on('message', async (event) => {
    try {
      const info = await school(event.text, event.channel)
  
      if (info) {
        const reply = await slack.sendMessage(info, event.channel)
        console.log('Message sent successfully', reply.ts)
      }
    } catch (error) {
      console.log('An error occurred', error)
    }
  });
  
  (async () => {
    await slack.start()
  })()
}
