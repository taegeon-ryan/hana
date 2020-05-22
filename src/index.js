const { RTMClient } = require('@slack/rtm-api')
const Discord = require('discord.js')
const colors = require('colors')
const fs = require('fs')

const school = require('./school')
const message = JSON.parse(fs.readFileSync('src/message.json').toString())

const slack = new RTMClient(process.env.slackToken)
const discord = new Discord.Client()

if (process.env.discordToken) {
  discord.on('ready', () => {
    console.log(`Logged in as ${discord.user.tag}!`)
    setInterval(() => {
      discord.user.setActivity(message.activity[Math.floor(Math.random() * message.activity.length)])
    }, 10000)
  })

  discord.on('message', async msg => {
    try {
      const info = await school(msg.content, msg.channel.id, 'discord', { type: '' })
      if (info) {
        const embed = new Discord.RichEmbed()
          .setColor('#f7cac9')
          .setTitle('하나')
          .setDescription(info)
        await msg.channel.send({embed})
        console.log(`Discord ${msg.channel.id}\n${msg.content}\n`.green, info)
      }
    } catch (error) {
      console.warn(`Discord ${msg.channel.id}\n${msg.content}\n`.red, error)
    }
  })

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
      slack.sendMessage(info[random], event.channel)
      console.log(`Slack ${event.channel}\n`.green, info[random])
    } catch (error) {
      console.warn(`Slack ${event.channel}\n`.red, error)
    }
  })
  
  slack.on('message', async event => {
    try {
      const info = await school(event.text, event.channel, 'slack')
  
      if (info) {
        await slack.sendMessage(info, event.channel)
        console.log(`Slack ${event.channel}\n${event.text}\n`.green, info)
      }
    } catch (error) {
      console.warn(`Slack ${event.channel}\n${event.text}\n`.red, error)
    }
  })
  
  (async () => {
    await slack.start()
  })()
}
