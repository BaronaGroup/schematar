import {Schema as SchemaType} from './schema'
import mongooseOutput from './mongoose-output'
import tsOutput, {TSOptions} from './ts-output'
import jsonSchemaOutput, {JSONSchemaOptions} from './json-schema-output'
import glob from 'glob'
import path from 'path'
import fs from 'fs'
import mkdirp from 'mkdirp'
import {ObjectId as ObjectIdType} from './object-id'
import nowToken from './now'
import ComplexType from './complex'
import {karhu} from './karhu'

export const ObjectId = ObjectIdType
export type Schema = SchemaType
export const Complex = ComplexType
export const now = nowToken
const log = karhu('schematar-api')

export function createMongooseSchema(schema: Schema, context = 'mongoose') {
  return mongooseOutput(schema)
}

export function createTypescriptInterfaceDefinition(exportName: string, schema: Schema, context: string = 'typescript', options: TSOptions = {}) {
  return tsOutput(exportName, schema, context, options)
}

export function createJSONSchema(schema: Schema, context: string = 'jsonschema', options: JSONSchemaOptions = {}) {
  return jsonSchemaOutput(schema, context, options)
}

export async function createTypescriptInterfaceFiles(sourceFileGlobOrFileArray: string | string[], outputPath: string, logCreations = false) {
  await new Promise((resolve, reject) => mkdirp(outputPath, (err => !err ? resolve() : reject(err))))
  const files = Array.isArray(sourceFileGlobOrFileArray) ? sourceFileGlobOrFileArray : glob.sync(sourceFileGlobOrFileArray)
  for (const file of files) {
    await createTSInterfaceFile(file, outputPath, logCreations)
  }
}

interface TypescriptSchema {
  name: string,
  context?: string,
  omitExtraExports?: boolean
  schema?: Schema
}

interface SchemaFile {
  name?: string
  default?: Schema
  schema?: Schema
  typescriptSchemas?: TypescriptSchema[]
}

async function createTSInterfaceFile(filename: string, outputPath: string, logCreations: boolean) {
  const schemaFile = require(path.resolve(filename)) as SchemaFile
  const topLevelSchema = schemaFile.schema || schemaFile.default
  const topLevelName = schemaFile.name || pickNameFromFilename(filename)
  const exported: string[] = []
  if (schemaFile.typescriptSchemas) {
    for (const schemaDef of schemaFile.typescriptSchemas) {
      const schema = schemaDef.schema || topLevelSchema,
        name = schemaDef.name || topLevelName

      if (!schema) throw new Error('No schema found for ' + name)
      exported.push(createTypescriptInterfaceDefinition(name, schema, schemaDef.context || 'typescript', schemaDef))
    }
  } else if (topLevelSchema) {
    exported.push(createTypescriptInterfaceDefinition(topLevelName, topLevelSchema))
  }

  const ext = path.extname(filename),
    basename = path.basename(filename, ext),
    outputFilename = path.join(outputPath, basename + '.schematar.ts')

  log.info('Storing typescript interfaces in', outputFilename)

  await new Promise((resolve, reject) => fs.writeFile(outputFilename, exported.join('\n'), 'utf8', err => !err ? resolve() : reject(err)))
}

function pickNameFromFilename(filename: string) {
  const fn = path.basename(filename, path.extname(filename))
  return fn[0].toUpperCase() + fn.substring(1)
}
