const {readFile, writeFile} = require('fs')
const {promisify} = require('util');
const {letters} = require('./letters')

const readFilePromise = promisify(readFile)
const writeFilePromise = promisify(writeFile)

async function prepareSummary() {
  const summary = {}
  let total = 0
  await Promise.all(
    letters.map(async letter => {
      console.log(`Preparing summary for letter ${letter}`)

      try {
        const file = await readFilePromise(`./data/${letter}.json`)
        const json = JSON.parse(file)
        total += Object.keys(json).length

        Object.entries(json)
          .forEach(([naselje, obcina]) => {
            if (!summary[obcina]) {
              summary[obcina] = {
                obcinaTotal: 0,
                naselja: []
              }
            }

            summary[obcina].obcinaTotal++
            summary[obcina].naselja.push(naselje)
          })
      } catch (err) {
        console.error(`Error while preparing summary for letter ${letter}`, err)
      }

      console.log(`Done for letter ${letter}`)
    })
  )
  summary.total = total
  await writeFilePromise('./data/summary.json', JSON.stringify(summary, null, 2))
  console.log('All done!')
}

prepareSummary()

