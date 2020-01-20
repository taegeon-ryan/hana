const { RTMClient } = require('@slack/rtm-api')
const rtm = new RTMClient(process.env.slackBotToken)

const School = require('node-school-kr')
const school = new School()

school.init(School.Type[process.env.schoolType], School.Region[process.env.schoolRegion], process.env.schoolCode)

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

const dateCenturyAbbr = [
  '하루',
  '이틀',
  '사흘',
  '나흘',
  '닷새',
  '엿새',
  '이레',
  '여드레',
  '아흐레'
]

const dateCentury = [
  '하룻',
  '이튿',
  '사흗',
  '나흗',
  '닷샛',
  '엿샛',
  '이렛',
  '여드렛',
  '아흐렛'
]

const dateConvert = (text) => {
  const date = new Date()

  function setDate (val) {
    if (text.includes('전')) {
      date.setDate(date.getDate() - val)
    } else if (text.includes('후') || text.includes('뒤')) {
      date.setDate(date.getDate() + val)
    } else {
      date.setDate(val)
    }
  }

  function setMonth (val) {
    if (text.includes('전')) {
      date.setMonth(date.getMonth() - val)
    } else if (text.includes('후') || text.includes('뒤')) {
      date.setMonth(date.getMonth() + val)
    } else {
      date.setMonth(val - 1)
    }
  }

  if (text.includes('일') && text.replace(/[^{0-9}]/gi, '')) {
    setDate(Number(text.replace(/[^{0-9}]/gi, '')))
  } else if (text.includes('월')) {
    setMonth(Number(text.replace(/[^{0-9}]/gi, '')))
  } else if (text.includes('그글피')) {
    date.setDate(date.getDate() + 4)
  } else if (text.includes('글피')) {
    date.setDate(date.getDate() + 3)
  } else if (text.includes('모레')) {
    date.setDate(date.getDate() + 2)
  } else if (text.includes('내일')) {
    date.setDate(date.getDate() + 1)
  } else if (text.includes('어제')) {
    date.setDate(date.getDate() - 1)
  } else if (text.includes('그저께') || text.includes('그제')) {
    date.setDate(date.getDate() - 2)
  } else if (text.includes('그끄저께') || text.includes('그끄제')) {
    date.setDate(date.getDate() - 3)
  } else if (text.includes('열흘')) {
    setDate(10)
  } else if (text.includes('스무날')) {
    setDate(20)
  } else if (text.includes('보름')) {
    setDate(15)
  } else if (text.includes('그믐')) {
    setDate(30)
  } else {
    for (const key in dateCenturyAbbr) {
      if (text.includes(dateCenturyAbbr[key]) || text.includes(dateCentury[key])) {
        if (text.includes('열')) {
          setDate(Number(key) + 11)
        } else if (text.includes('스무')) {
          setDate(Number(key) + 21)
        } else {
          setDate(Number(key) + 1)
        }

        return date
      }
    }
  }

  return date
}

rtm.on('message', async (event) => {
  try {
    const text = event.text

    if (text.includes('급식')) {
      const date = dateConvert(text)
      let meal = await school.getMeal({ year: date.getFullYear(), month: date.getMonth() + 1, default: '급식이 없습니다' })
      meal = meal[date.getDate()].replace(/[0-9*.]/gi, '')
      const info = date.getFullYear() + '년 ' + (date.getMonth() + 1) + '월 ' + date.getDate() + '일\n' + meal
      const reply = await rtm.sendMessage(info, event.channel)
      console.log('Message sent successfully', reply.ts)
    }

    if (text.includes('일정')) {
      const calendar = await school.getCalendar({ default: '일정 없는 날' })
      let info = `[${calendar.year}년 ${calendar.month}월]`

      delete calendar.year
      delete calendar.month

      for (const day in calendar) {
        info += `\n[${day}일] ${calendar[day]}`
      }

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
