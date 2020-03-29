const cheerio = require('cheerio')
const path = require('path')
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
        console.log("url", url)
        const result = await get(url)
        const $ = cheerio.load(result.data)
        // /html/body/div[3]/div[3]/div[4]/div/table
        //console.log('ma', $('.wikitable tbody tr').html())

        $('.wikitable').find('tbody tr').each((index, element) => {
          if (index > 0) {
            const naselje = $($(element).find('td')[0]).text()
            const obcina = $($(element).find('td')[1]).text()

            naseljaMap[naselje] = obcina
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
