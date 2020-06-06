const School = require('school-kr')
const school = new School()
const fs = require('fs')

const define = JSON.parse(fs.readFileSync('src/define.json').toString())
const search = {}

const load = (type) => {
  try {
    return JSON.parse(fs.readFileSync(`src/data/${type}.json`).toString())
  } catch {
    return {}
  }
}

const save = (type, info) => {
  try {
    fs.writeFileSync(`src/data/${type}.json`, JSON.stringify(info))
  } catch {
    fs.mkdirSync('src/data')
    fs.writeFileSync(`src/data/${type}.json`, JSON.stringify(info))
  }
}

const dateConvert = (text) => {
  const date = new Date()

  const setDate = (val, type) => {
    if (text.includes('전')) {
      type === 'Y' ? date.setFullYear(date.getFullYear() - val) : type === 'M' ? date.setMonth(date.getMonth() - val) : date.setDate(date.getDate() - val)
    } else if (text.match(/(후|뒤)/)) {
      type === 'Y' ? date.setFullYear(date.getFullYear() + val) : type === 'M' ? date.setMonth(date.getMonth() + val) : date.setDate(date.getDate() + val)
    } else {
      type === 'Y' ? date.setFullYear(val) : type === 'M' ? date.setMonth(val - 1) : date.setDate(val)
    }
  }

  if (text.includes('일') && text.replace(/[^{0-9}]/gi, '')) {
    setDate(Number(text.replace(/[^{0-9}]/gi, '')))
  }

  if (text.match(/(월|달)/)) {
    setDate(Number(text.replace(/[^{0-9}]/gi, '')), 'M')
  }

  if (text.includes('해')) {
    if ((text.match(/다/g) || []).length) {
      date.setDate(date.getFullYear() + text.match(/다/g).length, 'Y')
    } else if ((text.match(/지/g) || []).length) {
      date.setDate(date.getFullYear() - text.match(/지/g).length, 'Y')
    }
  }

  for (const i in define.dateExp) {
    if (text.match(RegExp(define.dateExp[i]))) {
      date.setDate(date.getDate() - 3 + Number(i))
    }
  }

  if (text.includes('년')) {
    setDate(Number(text.replace(/[^{0-9}]/gi, '')), 'Y')
    for (const i in define.dateYearExp) {
      if (text.match(RegExp(define.dateYearExp[i]))) {
        date.setDate(date.getFullYear() - 3 + Number(i), 'Y')
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

const meal = async (date, type) => {
  let meal = await school.getMeal({ year: date.getFullYear(), month: date.getMonth() + 1, default: `${type}이 없습니다\n` })
  meal = meal[date.getDate()].replace(/[0-9*.]|amp;/gi, '')

  if (meal.includes(`[${type}]`)) {
    const length = meal.indexOf(`[${type}]`)
    meal = meal.substring(length, meal.indexOf('[', length + 1) !== -1 ? meal.indexOf('[', length + 1) : meal.length)
  }

  return meal
}

const index = async (text, channel, type) => {
  let info
  if (text.includes('하나')) {
    if (text.match(/검색/)) {
      info = ''
      const result = []
      if (text.match(/.*(초|중|고|학교|유치원)/)) {
        for (const key in School.Region) {
          const splitText = text.match(/.*(초|중|고|학교|유치원)/)[0].split(' ')
          const search = await school.search(School.Region[key], splitText[splitText.length - 1])
          search.forEach(e => {
            let addr
            for (const name in define.region) {
              if (key === name) {
                addr = define.region[name]
              }
            }
            let type = 'HIGH'
            const schoolExp = { 중학교: 'MIDDLE', 초등학교: 'ELEMENTARY', 유치원: 'KINDERGARTEN' }
            for (const name in schoolExp) {
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
        info += '\n\'하나야 1번 등록해줘\'처럼 말해주면 채널에 등록해줄게'
      } else {
        info = '학교나 유치원 이름을 정확하게 입력해줘!'
      }
    }

    if (text.match(/등록/)) {
      const data = load(type)
      const searchData = search[channel]
      if (!searchData) {
        info = '채널에서 검색된 학교나 유치원이 없어!\n\'하나야 하나고등학교 검색해줘\'처럼 말해주면 내가 찾아줄게'
      } else {
        const i = searchData[Number(text.replace(/[^{0-9}]/gi, '')) - 1]
        info = `${i.name}${i.type === 'KINDERGARTEN' ? '을' : '를'} 채널에 등록했어!`
        data[channel] = { type: i.type, region: i.region, schoolCode: i.schoolCode }
      }
      save(type, data)
    }

    if (text.match(/(하나!|도움|도와)/)) {
      info = '내가 필요하면 \'하나!\'라고 불러줘\n\'하나야 급식\'처럼 부탁하거나 \'하나야 일정\'처럼 물어봐줘\n혹시 다른 학교나 유치원을 등록하려면 \'하나야 하나고 검색\'처럼 다시 부탁해줘!\n자세한건 https://github.com/momenthana/hana 여기서 참고하고'
      type === 'discord' ? info += '\n다른건 <@457459470424080384> 또는 momenthana@kakao.com으로 질문해줘!' : '\n다른건 momenthana@kakao.com으로 질문해줘!'
    }

    const match = text.match(/(조식|중식|석식|급식)/)
    if (match) {
      const data = load(type)[channel]
      const date = dateConvert(text)
      if (!data) {
        info = '채널에 등록된 학교나 유치원이 없어!\n\'하나야 하나고등학교 검색해줘\'처럼 말해주면 내가 찾아줄게'
      } else {
        school.init(School.Type[data.type], School.Region[data.region], data.schoolCode)
        info = `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일 (${define.week[date.getDay()]})\n`
        info += await meal(date, match[0])
      }
    }

    if (text.includes('일정')) {
      const data = load(type)[channel]
      if (!data) {
        info = '채널에 등록된 학교나 유치원이 없어!\n\'하나야 하나고등학교 검색해줘\'처럼 말해주면 내가 찾아줄게'
      } else {
        school.init(School.Type[data.type], School.Region[data.region], data.schoolCode)
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
