const { RTMClient } = require('@slack/rtm-api')
const Discord = require('discord.js');
const school = require('./school')
const fs = require('fs')
const message = JSON.parse(fs.readFileSync('src/message.json').toString())

const slack = new RTMClient(process.env.slackToken)
const discord = new Discord.Client()

if (process.env.discordToken) {
  discord.on('message', async msg => {
    try {
      const info = await school(msg.content, msg.channel.id)
      if (info) {
        await msg.reply(info)
        console.log('Discord', msg.channel.id, '\n' + msg.content, '\n' + info)
      }
    } catch (error) {
      console.warn(error)
    }
  });

  discord.login(process.env.discordToken)
}

if (process.env.slackToken) {
  slack.on('member_joined_channel', async event => {
    const info = []
    message.joined.forEach(e => {
      info.push(e.replace('${event.user}', `${event.user}`))
    })
  
    try {
      const random = Math.floor(Math.random() * info.length)
      slack.sendMessage('Slack', event.channel, info[random])
      console.log('Slack', event.channel, '\n' + info[random])
    } catch (error) {
      console.warn(error)
    }
  })
  
  slack.on('message', async event => {
    try {
      const info = await school(event.text, event.channel)
  
      if (info) {
        await slack.sendMessage(info, event.channel)
        console.log('Slack', event.channel, '\n' + event.text, '\n' + info)
      }
    } catch (error) {
      console.warn(error)
    }
  });
  
  (async () => {
    await slack.start()
  })()
}
