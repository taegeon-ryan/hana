require('dotenv').config()

const { RTMClient } = require('@slack/rtm-api')
const rtm = new RTMClient(process.env.SLACK_BOT_TOKEN)

const School = require('node-school-kr')
const school = new School()

school.init(eval('School.Type.' + process.env.SCHOOL_TYPE), eval('School.Region.' + process.env.SCHOOL_REGION), process.env.SCHOOL_CODE)

const message = [
  '`안녕, 친구들! <@${event.user}> 등장!`',
  '`우린 당신을 기다리고 있었어요 <@${event.user}> 님`',
  '`<@${event.user}> 님이 방금 서버에 참가하셨어요. 그럼 이제 게임을 즐겨보세요!`',
  '`<@${event.user}> 님이 파티에 참가하셨어요.`',
  '`저기요! 들어봐요! <@${event.user}> 님이 참가하셨어요!`',
  '`<@${event.user}>님이 배틀 버스에 탑승했어요.`',
  '`마음의 준비를 하세요. <@${event.user}> 님이 방금 서버에 참가하셨어요.`',
  '`도전자 등장 - <@${event.user}> 님이 나타나셨어요!`',
  '`<@${event.user}> 님이 어디로 가셨을까요? 이 서버에 있으시네요!`',
  '`<@${event.user}> 님이 서버에 스폰하셨어요.`'
]

rtm.on('member_joined_channel', async (event) => {
  try {
    random = Math.floor(Math.random() * message.length)
    const reply = await rtm.sendMessage(eval(message[random]), event.channel)
    console.log('Message sent successfully', reply.ts)
  } catch (error) {
    console.log('An error occurred', error)
  }
});

const dateConvert = (text) => {
  let date = new Date()

  function setDate (val) {
    if (text.includes("전"))
      date.setDate(date.getDate() - val)
    else if (text.includes("후") || text.includes("뒤"))
      date.setDate(date.getDate() + val)
    else
      date.setDate(date.getDate() + val)
  }

  if (text.includes("하루") && text.includes("전") || text.includes("후"))
    setDate(1)
  else if (text.includes("이틀") && text.includes("전") || text.includes("후"))
    setDate(2)
  else if (text.includes("모레"))
    setDate(2)
  else if (text.includes("내일"))
    setDate(1)

  return date
}

rtm.on('message', async (event) => {
  try {
    const text = event.text

    if (text.includes("급식")) {
      let date = dateConvert(text)
      let meal = await school.getMeal({ default: '급식이 없습니다' }, date.getFullYear(), date.getMonth()+1)
      const reply = await rtm.sendMessage(meal[date.getDate()], event.channel)
      console.log('Message sent successfully', reply.ts)
    }
    
    if (text.includes("일정")) {
      const calendar = await school.getCalendar({ default: '일정 없는 날' })
      msg = `[${calendar.year}년 ${calendar.month}월]`

      delete calendar.year
      delete calendar.month

      for(let day in calendar) {
        msg += `\n[${day}일] ${calendar[day]}`
      }

      const reply = await rtm.sendMessage(msg, event.channel)
      console.log('Message sent successfully', reply.ts)
    }
  } catch (error) {
    console.log('An error occurred', error)
  }
});

(async () => {
  await rtm.start()
})()
