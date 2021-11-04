import { createTypeGraphQLClassFiles, createTypescriptInterfaceFiles } from './api'
import { getConfig, loadConfig } from './config'
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
    case 'create-type-graphql-classes': {
      const outDir = process.argv[3]
      if (!outDir) throw new Error('Specify output directory')
      const files = process.argv.slice(4)
      await createTypeGraphQLClassFiles(files, outDir, true)
      break
    }
    case undefined: {
      loadConfig()
      const config = getConfig()
      for (const transformation of config.transformations ?? []) {
        if (transformation.typescriptInterfaces) {
          await createTypescriptInterfaceFiles(transformation.schemaFiles, transformation.outputDirectory, true)
        }
        if (transformation.typeGraphQLClasses) {
          await createTypeGraphQLClassFiles(transformation.schemaFiles, transformation.outputDirectory, true)
        }
      }

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
