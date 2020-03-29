const cheerio = require('cheerio')
const {get} = require('axios')
const {writeFile} = require('fs')
const {promisify} = require('util');

const {letters} = require('./letters')

const writeFilePromise = promisify(writeFile)
const returnUrl = letter => `https://sl.wikipedia.org/wiki/Seznam_naselij_v_Sloveniji_(${encodeURIComponent(letter)})`

async function scrapeWikipedia() {
  await Promise.all(
    letters.map(async letter => {
      console.log(`Scraping for letter ${letter}`)
      const url = returnUrl(letter)
      const naseljaMap = {}
      try {
        const result = await get(url)
        const $ = cheerio.load(result.data)
        const naseljeIndex = 0;
        let obcinaIndex = 1; // default

        $('.wikitable').find('tbody tr').each((index, element) => {
          if (index === 0) { // if the table header
            $($(element).children()).each((headerIndex, headerEl) => {
              if ($(headerEl).text() === 'Občina') {
                obcinaIndex = headerIndex;
              }
            })
          }

          if (index > 0) {
            const naselje = $($(element).find('td')[naseljeIndex]).text().trim()
            const obcina = $($(element).find('td')[obcinaIndex]).text().trim()
            const obcinaClean = obcina.replace(/Mestna občina\ |Občina\ /, '')

            naseljaMap[naselje] = obcinaClean
          }
        })
        await writeFilePromise(
          `./data/${letter}.json`, 
          JSON.stringify(naseljaMap, null, 2)
        )
      } catch(err) {
        console.error('something went wrong', err)
      }

      console.log(`Done for letter ${letter}`)
    })
  )
  console.log('All done')
}

module.exports.scrapeWikipedia = scrapeWikipedia

scrapeWikipedia()
