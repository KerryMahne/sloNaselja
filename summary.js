const {readFile, writeFile} = require('fs')
const {promisify} = require('util');
const {letters} = require('./letters')

const readFilePromise = promisify(readFile)
const writeFilePromise = promisify(writeFile)

async function prepareSummary() {
  const summary = {
    obcine: {},
    total: 0
  }
  await Promise.all(
    letters.map(async letter => {
      console.log(`Preparing summary for letter ${letter}`)

      try {
        const file = await readFilePromise(`./data/${letter}.json`)
        const json = JSON.parse(file)
        summary.total += Object.keys(json).length

        Object.entries(json)
          .forEach(([naselje, obcina]) => {
            if (!summary.obcine[obcina]) {
              summary.obcine[obcina] = {
                obcinaTotal: 0,
                naselja: []
              }
            }

            summary.obcine[obcina].obcinaTotal++
            summary.obcine[obcina].naselja.push(naselje)
          })
      } catch (err) {
        console.error(`Error while preparing summary for letter ${letter}`, err)
      }

      console.log(`Done for letter ${letter}`)
    })
  )
  await writeFilePromise('./data/summary.json', JSON.stringify(summary, null, 2))
  console.log('All done!')
}

prepareSummary()

