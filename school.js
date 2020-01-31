const School = require('node-school-kr')
const school = new School()

school.init(School.Type[process.env.schoolType], School.Region[process.env.schoolRegion], process.env.schoolCode)

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

  function setYear (val) {
    if (text.includes('전')) {
      date.setFullYear(date.getFullYear() - val)
    } else if (text.includes('후') || text.includes('뒤')) {
      date.setFullYear(date.getFullYear() + val)
    } else {
      date.setFullYear(val)
    }
  }

  if (text.includes('일') && text.replace(/[^{0-9}]/gi, '')) {
    setDate(Number(text.replace(/[^{0-9}]/gi, '')))
  } else if (text.includes('월')) {
    setMonth(Number(text.replace(/[^{0-9}]/gi, '')))
  } else if (text.includes('년')) {
    setYear(Number(text.replace(/[^{0-9}]/gi, '')))
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

const index = async (text) => {
  let info

  if (text.includes('급식')) {
    const date = dateConvert(text)
    let meal = await school.getMeal({ year: date.getFullYear(), month: date.getMonth() + 1, default: '급식이 없습니다' })
    meal = meal[date.getDate()].replace(/[0-9*.]/gi, '')
    info = date.getFullYear() + '년 ' + (date.getMonth() + 1) + '월 ' + date.getDate() + '일\n' + meal
  }

  if (text.includes('일정')) {
    const calendar = await school.getCalendar({ default: '일정 없는 날' })
    info = `[${calendar.year}년 ${calendar.month}월]`

    delete calendar.year
    delete calendar.month

    for (const day in calendar) {
      info += `\n[${day}일] ${calendar[day]}`
    }
  }

  return info
}

module.exports = index