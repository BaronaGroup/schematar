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
import {generateHash} from './hash-schema'

export const ObjectId = ObjectIdType
export type Schema = SchemaType
export const Complex = ComplexType
export const now = nowToken
const log = karhu('schematar-api')

export function createMongooseSchema(schema: Schema, context = 'mongoose') {
  return mongooseOutput(schema, context)
}

export function createTypescriptInterfaceDefinition(exportName: string, schema: Schema, context: string = 'typescript', options: TSOptions = {}) {
  return tsOutput(exportName, schema, context, options)
}

export function createJSONSchema(schema: Schema, context: string = 'jsonschema', options: JSONSchemaOptions = {}) {
  return jsonSchemaOutput(schema, context, options)
}

export async function createTypescriptInterfaceFiles(sourceFileGlobOrFileArray: string | string[], outputPath: string, logCreations = false) {
  await new Promise((resolve, reject) => mkdirp(outputPath, (err => !err ? resolve() : reject(err))))
  const files = [].concat(...Array.isArray(sourceFileGlobOrFileArray) ? sourceFileGlobOrFileArray.map(f => glob.sync(f)) : [glob.sync(sourceFileGlobOrFileArray)])
  for (const file of files) {
    await createTSInterfaceFile(file, outputPath, logCreations)
  }
}

export interface TypescriptSchemaDefinition {
  name: string,
  context?: string,
  omitExtraExports?: boolean
  schema?: Schema
  exportHash?: string
  doNotImportObjectId?: boolean
}

interface SchemaFile {
  name?: string
  default?: Schema
  schema?: Schema
  typescriptSchemas?: TypescriptSchemaDefinition[]
}

async function createTSInterfaceFile(filename: string, outputPath: string, logCreations: boolean = true) {
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
      exported.push(createTypescriptInterfaceDefinition(name, schema, schemaDef.context || 'typescript', {
        ...schemaDef,
        doNotImportObjectId: schemaDef.doNotImportObjectId || typescriptSchemas.indexOf(schemaDef) > 0
      }))
    }
  } else if (topLevelSchema) {
    exported.push(createTypescriptInterfaceDefinition(topLevelName, topLevelSchema))
  }

  const ext = path.extname(filename),
    basename = path.basename(filename, ext),
    outputFilename = path.join(outputPath, basename + '.schematar.ts')

  if (logCreations) {
    log.info('Storing typescript interfaces in', outputFilename)
  }

  if (exported.length) {
    await new Promise((resolve, reject) => fs.writeFile(outputFilename, exported.join('\n'), 'utf8', err => !err ? resolve() : reject(err)))
  }
}

function pickNameFromFilename(filename: string) {
  const fn = path.basename(filename, path.extname(filename))
  return (fn[0].toUpperCase() + fn.substring(1))
    .replace(/[\-_][a-z]/g, match => match[1].toUpperCase())
    .replace(/[^a-zA-Z0-9]/g, '')
}

export function hashSchema(schema: Schema) {
  return generateHash(schema)
}
