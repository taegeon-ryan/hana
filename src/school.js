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

  const dateExp = ['(그끄저께|그끄제)', '(그저께|그제)', '어제', '오늘', '내일', '모레', '글피', '그글피']
  for (const i in dateExp) {
    if (text.match(RegExp(dateExp[i]))) {
      date.setDate(date.getDate() - 3 + Number(i))
    }
  }

  if (text.includes('작년')) {
    date.setFullYear(date.getFullYear() - 1)
  } else if (text.includes('재작년')) {
    date.setFullYear(date.getFullYear() - 2)
  } else if (text.includes('년')) {
    setYear(Number(text.replace(/[^{0-9}]/gi, '')))
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
  let info

  if (text.match(/검색/)) {
    info = ''
    const result = []
    for (const key in School.Region) {
      const search = await new School().search(School.Region[key], text.match(/.*(초|중|고|학교|유치원)/)[0])
      search.forEach(e => {
        let addr
        switch (key) {
          case 'SEOUL':
            addr = '서울특별시교육청 소재'
            break
          case 'INCHEON':
            addr = '인천광역시교육청 소재'
            break
          case 'BUSAN':
            addr = '부산광역시교육청 소재'
            break
          case 'GWANGJU':
            addr = '광주광역시교육청 소재'
            break
          case 'DAEJEON':
            addr = '대전광역시교육청 소재'
            break
          case 'DEAGU':
            addr = '대구광역시교육청 소재'
            break
          case 'SEJONG':
            addr = '세종특별시교육청 소재'
            break
          case 'ULSAN':
            addr = '울산광역시교육청 소재'
            break
          case 'GYEONGGI':
            addr = '경기도교육청 소재'
            break
          case 'KANGWON':
            addr = '강원도교육청 소재'
            break
          case 'CHUNGBUK':
            addr = '충청북도교육청 소재'
            break
          case 'CHUNGNAM':
            addr = '충청남도교육청 소재'
            break
          case 'GYEONGBUK':
            addr = '경상북도교육청 소재'
            break
          case 'GYEONGNAM':
            addr = '경상남도교육청 소재'
            break
          case 'JEONBUK':
            addr = '전라북도교육청 소재'
            break
          case 'JEONNAM':
            addr = '전라남도교육청 소재'
            break
          case 'JEJU':
            addr = '제주특별자치도교육청 소재'
            break
          default:
            addr = '교육청 소재지 파악불가'
            break
        }
        result.push({ name: e.name, schoolCode: e.schoolCode, schoolRegion: addr, address: e.address })
      })
    }
    for (const key in result) {
      info += `\n${Number(key) + 1}. ${result[key].name} (${result[key].address !== ' ' ? result[key].address : result[key].schoolRegion})`
    }
  }

  const date = dateConvert(text)
  const match = text.match(/(조식|중식|석식|급식)/)
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
