const School = require('school-kr')
const fs = require('fs')

const school = new School()
const define = JSON.parse(fs.readFileSync('src/define.json').toString())

school.init(School.Type[process.env.type], School.Region[process.env.region], process.env.schoolCode)

const dateConvert = (text) => {
  const date = new Date()

  const setDate = (val) => {
    if (text.includes('전')) {
      date.setDate(date.getDate() - val)
    } else if (text.includes('후') || text.includes('뒤')) {
      date.setDate(date.getDate() + val)
    } else {
      date.setDate(val)
    }
  }

  const setMonth = (val) => {
    if (text.includes('전')) {
      date.setMonth(date.getMonth() - val)
    } else if (text.includes('후') || text.includes('뒤')) {
      date.setMonth(date.getMonth() + val)
    } else {
      date.setMonth(val - 1)
    }
  }

  const setYear = (val) => {
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
  }

  if (text.includes('월')) {
    setMonth(Number(text.replace(/[^{0-9}]/gi, '')))
  }

  if (text.includes('해')) {
    if ((text.match(/다/g) || []).length) {
      date.setFullYear(date.getFullYear() + text.match(/다/g).length)
    } else if ((text.match(/지/g) || []).length) {
      date.setFullYear(date.getFullYear() - text.match(/지/g).length)
    }
  }

  if (text.includes('작년')) {
    date.setFullYear(date.getFullYear() - 1)
  } else if (text.includes('재작년')) {
    date.setFullYear(date.getFullYear() - 2)
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
    for (const key in define.dateCentury) {
      if (text.includes(define.dateCentury[key]) || text.includes(define.dateCenturyAbbr[key])) {
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

const meal = async (date, type) => {
  let meal = await school.getMeal({ year: date.getFullYear(), month: date.getMonth() + 1, default: `${type}이 없습니다\n` })
  meal = meal[date.getDate()].replace(/[0-9*.]/gi, '')

  if (meal.includes(`[${type}]`)) {
    const length = meal.indexOf(`[${type}]`)
    meal = meal.substring(length, meal.indexOf('[', length + 1) !== -1 ? meal.indexOf('[', length + 1) : meal.length)
  }

  return meal
}

const index = async (text) => {
  const date = dateConvert(text)
  let match = text.match(/(조식|중식|석식|급식)/)
  let info

  if (match) {
    info = `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일 (${define.week[date.getDay()]})\n`
    info += await meal(date, match[0])
  }

  if (text.includes('일정')) {
    const calendar = await school.getCalendar({ default: '일정 없는 날' })
    info = `[${calendar.year}년 ${calendar.month}월]\n`

    delete calendar.year
    delete calendar.month

    for (const day in calendar) {
      info += `[${day}일] ${calendar[day]}\n`
    }
  }

  return info
}

module.exports = index
