import fs from 'fs'
import path from 'path'

import mkdirp from 'mkdirp'

import ComplexType from './complex'
import { generateHash } from './hash-schema'
import jsonSchemaOutput, { JSONSchemaOptions } from './json-schema-output'
import { karhu } from './karhu'
import mongooseOutput from './mongoose-output'
import nowToken from './now'
import { ObjectId as ObjectIdType } from './object-id'
import { Schema as SchemaType } from './schema'
import tsOutput, { TSOptions } from './ts-output'

export const ObjectId = ObjectIdType
export type Schema = SchemaType
export const Complex = ComplexType
export const now = nowToken
const log = karhu('schematar-api')

export function createMongooseSchema(schema: Schema, context = 'mongoose') {
  return mongooseOutput(schema, context)
}

export function createTypescriptInterfaceDefinition(
  exportName: string,
  schema: Schema | ComplexType,
  context: string = 'typescript',
  options: TSOptions = {}
) {
  return tsOutput(exportName, schema, context, options)
}

export function createJSONSchema(schema: Schema, context: string = 'jsonschema', options: JSONSchemaOptions = {}) {
  return jsonSchemaOutput(schema, context, options)
}

export async function createTypescriptInterfaceFiles(
  sourceFileGlobOrFileArray: string | string[],
  outputPath: string,
  logCreations = false
) {
  const { default: glob } = await import('glob')
  await new Promise((resolve, reject) => mkdirp(outputPath, (err) => (!err ? resolve() : reject(err))))
  const files = [].concat(
    ...(Array.isArray(sourceFileGlobOrFileArray)
      ? sourceFileGlobOrFileArray.map((f) => glob.sync(f))
      : [glob.sync(sourceFileGlobOrFileArray)])
  )
  for (const file of files) {
    await createTSInterfaceFile(file, outputPath, logCreations)
  }
}

export interface TypescriptSchemaDefinition {
  name: string
  context?: string
  omitExtraExports?: boolean
  schema?: Schema | ComplexType
  exportHash?: string
  doNotImportObjectId?: boolean
}

interface SchemaFile {
  name?: string
  default?: Schema
  schema?: Schema
  typescriptSchemas?: TypescriptSchemaDefinition[]
}

export async function createTSInterfaceFile(
  filename: string,
  outputPath: string,
  logCreations: boolean = true,
  formatOutputFilename = defaultOutputFilenameFormatter
) {
  const schemaFile = require(path.resolve(filename)) as SchemaFile
  const topLevelSchema = schemaFile.schema || schemaFile.default
  const topLevelName = schemaFile.name || pickNameFromFilename(filename)
  const exported: string[] = []
  if (schemaFile.typescriptSchemas) {
    const typescriptSchemas = schemaFile.typescriptSchemas
    for (const schemaDef of typescriptSchemas) {
      const schema = schemaDef.schema || topLevelSchema,
        name = schemaDef.name || topLevelName

      if (!schema) throw new Error('No schema found for ' + name)
      exported.push(
        createTypescriptInterfaceDefinition(name, schema, schemaDef.context || 'typescript', {
          ...schemaDef,
          doNotImportObjectId: schemaDef.doNotImportObjectId || typescriptSchemas.indexOf(schemaDef) > 0,
        })
      )
    }
  } else if (topLevelSchema) {
    exported.push(createTypescriptInterfaceDefinition(topLevelName, topLevelSchema))
  }
  const outputFilename = path.join(outputPath, formatOutputFilename(filename))

  if (logCreations) {
    log.info('Storing typescript interfaces in', outputFilename)
  }

  if (exported.length) {
    await new Promise((resolve, reject) =>
      fs.writeFile(outputFilename, exported.join('\n'), 'utf8', (err) => (!err ? resolve() : reject(err)))
    )
  }
}

function defaultOutputFilenameFormatter(inputFilename: string) {
  const ext = path.extname(inputFilename),
    basename = path.basename(inputFilename, ext)

  return basename + '.schematar.ts'
}

function pickNameFromFilename(filename: string) {
  const fn = path.basename(filename, path.extname(filename))
  return (fn[0].toUpperCase() + fn.substring(1))
    .replace(/[\-_][a-z]/g, (match) => match[1].toUpperCase())
    .replace(/[^a-zA-Z0-9]/g, '')
}

export function hashSchema(schema: Schema | ComplexType) {
  return generateHash(schema)
}
