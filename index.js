require('dotenv').config()

const { RTMClient } = require('@slack/rtm-api')
const rtm = new RTMClient(process.env.SLACK_BOT_TOKEN)

const School = require('node-school-kr')
const school = new School()

school.init(eval('School.Type.' + process.env.SCHOOL_TYPE), eval('School.Region.' + process.env.SCHOOL_REGION), process.env.SCHOOL_CODE)

rtm.on('member_joined_channel', async (event) => {
  try {
    const reply = await rtm.sendMessage(`안녕, 친구들! <@${event.user}> 등장!`, event.channel)
    console.log('Message sent successfully', reply.ts)
  } catch (error) {
    console.log('An error occurred', error)
  }
});

rtm.on('message', async (event) => {
  try {
    const text = event.text

    if (text.includes("급식")) {
      const meal = await school.getMeal({ default: '급식이 없습니다' })
      reply = await rtm.sendMessage(meal.today, event.channel)
    }
    
    if (text.includes("일정")) {
      const calendar = await school.getCalendar({ default: '일정 없는 날' })
      msg = `[${calendar.year}년 ${calendar.month}월]`

      delete calendar.year
      delete calendar.month

      for(var day in calendar) {
        msg += `\n[${day}일] ${calendar[day]}`
      }

      reply = await rtm.sendMessage(msg, event.channel)
    }

    console.log('Message sent successfully', reply.ts)
  } catch (error) {
    console.log('An error occurred', error)
  }
});

(async () => {
  await rtm.start()
})()