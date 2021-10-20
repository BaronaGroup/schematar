import { createTypescriptInterfaceFiles } from './api'
import { karhu } from './karhu'

const log = karhu('schematar')

async function run() {
  const command = process.argv[2]
  switch (command) {
    case 'create-typescript-interfaces': {
      const outDir = process.argv[3]
      if (!outDir) throw new Error('Specify output directory')
      const files = process.argv.slice(4)
      await createTypescriptInterfaceFiles(files, outDir, true)
      break
    }
    default:
      throw new Error('Invalid command ' + command)
  }
}

run().catch((err) => {
  log.error(err)
  process.exit(66)
})
