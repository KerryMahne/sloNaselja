const {readFile} = require('fs')
const {promisify} = require('util');

const readFilePromise = promisify(readFile)

async function mostSettlements() {
  try {
    const file = await readFilePromise('./data/summary.json')
    const json = JSON.parse(file)

    const munMostSettlements = Object.entries(json.obcine)
      .sort((obcina1, obcina2) => {
        const [, obcina1Data] = obcina1
        const [, obcina2Data] = obcina2

        const {obcinaTotal: obcina1Total} = obcina1Data
        const {obcinaTotal: obcina2Total} = obcina2Data

        if (obcina1Total === obcina2Total) return 0
        else return obcina1Total > obcina2Total ? 1 : -1
      })

    console.log("wat mona", munMostSettlements.reverse())
  } catch (err) {
    console.error('error while preparing most settlement data', err)
  }
}

mostSettlements()
