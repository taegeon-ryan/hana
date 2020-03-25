const School = require('school-kr')
const fs = require('fs')

const define = JSON.parse(fs.readFileSync('src/define.json').toString())
const tmp = {}

const load = () => {
  try {
    return JSON.parse(fs.readFileSync('src/data.json').toString())
  } catch {
    return {}
  }
}

const save = (info) => {
  fs.writeFileSync('src/data.json', JSON.stringify(info))
}

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

const meal = async (school, date, type) => {
  let meal = await school.getMeal({ year: date.getFullYear(), month: date.getMonth() + 1, default: `${type}이 없습니다\n` })
  meal = meal[date.getDate()].replace(/[0-9*.]/gi, '')

  if (meal.includes(`[${type}]`)) {
    const length = meal.indexOf(`[${type}]`)
    meal = meal.substring(length, meal.indexOf('[', length + 1) !== -1 ? meal.indexOf('[', length + 1) : meal.length)
  }

  return meal
}

const index = async (text, channel) => {
  let info

  if (text.match(/검색/)) {
    info = ''
    const result = []
    for (const key in School.Region) {
      const search = await new School().search(School.Region[key], text.match(/.*(초|중|고|학교|유치원)/)[0])
      search.forEach(e => {
        let addr
        key === 'SEOUL' ? addr = '서울특별시'
          : key === 'INCHEON' ? addr = '인천광역시'
            : key === 'BUSAN' ? addr = '부산광역시'
              : key === 'GWANGJU' ? addr = '광주광역시'
                : key === 'DAEJEON' ? addr = '대전광역시'
                  : key === 'DEAGU' ? addr = '대구광역시'
                    : key === 'SEJONG' ? addr = '세종특별시'
                      : key === 'ULSAN' ? addr = '울산광역시'
                        : key === 'GYEONGGI' ? addr = '경기도'
                          : key === 'KANGWON' ? addr = '강원도'
                            : key === 'CHUNGBUK' ? addr = '충청북도'
                              : key === 'CHUNGNAM' ? addr = '충청남도'
                                : key === 'GYEONGBUK' ? addr = '경상북도'
                                  : key === 'GYEONGNAM' ? addr = '경상남도'
                                    : key === 'JEONBUK' ? addr = '전라북도'
                                      : key === 'JEONNAM' ? addr = '전라남도'
                                        : key === 'JEJU' ? addr = '제주특별자치도'
                                          : addr = null
        let type = 'HIGH'
        if (e.name.match(/중학교/)) {
          type = 'MIDDLE'
        } else if (e.name.match(/초등학교/)) {
          type = 'ELEMENTARY'
        } else if (e.name.match(/유치원/)) {
          type = 'KINDERGARTEN'
        }
        result.push({ name: e.name, type: type, schoolCode: e.schoolCode, region: key, schoolRegion: addr, address: e.address })
      })
    }
    for (const key in result) {
      info += `\n${Number(key) + 1}. ${result[key].name} (${result[key].address !== ' ' ? result[key].address : result[key].schoolRegion ? result[key].schoolRegion + '교육청 소재' : '소재지 정보 없음'})`
      tmp[channel] = result
    }
  }

  if (text.match(/등록/)) {
    const data = load()
    if (!tmp[channel]) {
      info = '채널에서 검색된 학교가 없어!'
    } else {
      let i = tmp[channel][Number(text.replace(/[^{0-9}]/gi, '')) - 1]
      if (!data.slack) {
        data.slack = {}
      }
      info = `${i.name}를(을) 채널에 등록했어!`
      data.slack[channel] = { type: i.type, region: i.region, schoolCode: i.schoolCode }
    }
    save(data)
  }

  const date = dateConvert(text)
  const match = text.match(/(조식|중식|석식|급식)/)
  if (match) {
    const data = load()
    const school = new School()
    school.init(School.Type[data.slack[channel].type], School.Region[data.slack[channel].region], data.slack[channel].schoolCode)
    if (!data.slack) {
      data.slack = {}
    }
    if (!data.slack[channel]) {
      info = "채널에 등록된 학교가 없습니다!"
    } else {
      info = `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일 (${define.week[date.getDay()]})\n`
      info += await meal(school, date, match[0])
    }
  }

  if (text.includes('일정')) {
    const data = load()
    const school = new School()
    school.init(School.Type[data.slack[channel].type], School.Region[data.slack[channel].region], data.slack[channel].schoolCode)
    if (!data.slack[channel]) {
      info = "채널에 등록된 학교가 없습니다!"
    } else {
      const calendar = await school.getCalendar({ default: null })
      info = `[${calendar.year}년 ${calendar.month}월]\n`
      console.log(calendar)

      delete calendar.year
      delete calendar.month
      delete calendar.day
      delete calendar.today

      for (const day in calendar) {
        if (calendar[day]) {
          info += `[${day}일] ${calendar[day]}\n`
        }
      }
    }
  }

  return info
}

module.exports = index
