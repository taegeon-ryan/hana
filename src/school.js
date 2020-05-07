const School = require('school-kr')
const school = new School()
const fs = require('fs')

const define = JSON.parse(fs.readFileSync('src/define.json').toString())
const search = {}

const load = () => {
  try {
    return JSON.parse(fs.readFileSync('src/data/slack.json').toString())
  } catch {
    return {}
  }
}

const save = (info) => {
  fs.writeFileSync('src/data/slack.json', JSON.stringify(info))
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

  if (text.includes('월') || text.includes('달')) {
    setMonth(Number(text.replace(/[^{0-9}]/gi, '')))
  }

  if (text.includes('해')) {
    if ((text.match(/다/g) || []).length) {
      date.setFullYear(date.getFullYear() + text.match(/다/g).length)
    } else if ((text.match(/지/g) || []).length) {
      date.setFullYear(date.getFullYear() - text.match(/지/g).length)
    }
  }

  let dateExp = ['(그끄저께|그끄제)', '(그저께|그제)', '어제', '오늘', '내일', '모레', '글피', '그글피']
  for (let i in dateExp) {
    if (text.match(RegExp(dateExp[i]))) {
      date.setDate(date.getDate() - 3 + Number(i))
    }
  }
  
  if (text.includes('년')) {
    setYear(Number(text.replace(/[^{0-9}]/gi, '')))
    dateExp = ['재재작년', '재작년', '작년', '올해', '내년', '후년', '(내후년|후후년)']
    for (let i in dateExp) {
      if (text.match(RegExp(dateExp[i]))) {
        date.setFullYear(date.getFullYear() - 3 + Number(i))
      }
    }
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
  if (text.includes('하나')) {
    if (text.match(/검색/)) {
      info = ''
      const result = []
      if (text.match(/.*(초|중|고|학교|유치원)/)) {
        for (let key in School.Region) {
          splitText = text.match(/.*(초|중|고|학교|유치원)/)[0].split(' ')
          const search = await school.search(School.Region[key], splitText[splitText.length - 1])
          search.forEach(e => {
            let addr
            for (const name in define.region) {
              if (key === name) {
                addr = define.region[name]
              }
            }
            let type = 'HIGH'
            let schoolExp = { '중학교': 'MIDDLE', '초등학교': 'ELEMENTARY', '유치원': 'KINDERGARTEN' }
            for (let name in schoolExp) {
              if (e.name.match(name)) {
                type = schoolExp[name]
              }
            }
            result.push({ name: e.name, type: type, schoolCode: e.schoolCode, region: key, schoolRegion: addr, address: e.address })
          })
        }
        for (const key in result) {
          info += `\n${Number(key) + 1}. ${result[key].name} (${result[key].address !== ' ' ? result[key].address : result[key].schoolRegion ? result[key].schoolRegion + '교육청 소재' : '소재지 정보 없음'})`
          search[channel] = result
        }
        info += `\n'1번 등록해줘'처럼 말해주면 채널에 등록해줄게`
      } else {
        info = '학교나 유치원 이름을 정확하게 입력해줘!'
      }
    }

    if (text.match(/등록/)) {
      const data = load()
      if (!search[channel]) {
        info = `채널에서 검색된 학교나 유치원이 없어!\n'하나고등학교 검색해줘'처럼 말해주면 내가 찾아줄게`
      } else {
        let i = search[channel][Number(text.replace(/[^{0-9}]/gi, '')) - 1]
        info = `${i.name}${i.type == 'KINDERGARTEN' ? '을' : '를'} 채널에 등록했어!`
        data[channel] = { type: i.type, region: i.region, schoolCode: i.schoolCode }
      }
      save(data)
    }

    const date = dateConvert(text)
    const match = text.match(/(조식|중식|석식|급식)/)
    if (match) {
      const data = load()
      if (!data[channel]) {
        info = `채널에 등록된 학교나 유치원이 없어!\n'하나고등학교 검색해줘'처럼 말해주면 내가 찾아줄게`
      } else {
        school.init(School.Type[data[channel].type], School.Region[data[channel].region], data[channel].schoolCode)
        info = `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일 (${define.week[date.getDay()]})\n`
        info += await meal(school, date, match[0])
      }
    }

    if (text.includes('일정')) {
      const data = load()
      if (!data[channel]) {
        info = `채널에 등록된 학교나 유치원이 없어!\n'하나고등학교 검색해줘'처럼 말해주면 내가 찾아줄게`
      } else {
        school.init(School.Type[data[channel].type], School.Region[data[channel].region], data[channel].schoolCode)
        const calendar = await school.getCalendar({ default: null })
        info = `[${calendar.year}년 ${calendar.month}월]\n`

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
  }

  return info
}

module.exports = index
