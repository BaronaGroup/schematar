import fs from 'fs'
import path from 'path'

import mkdirp from 'mkdirp'

import ComplexType from './complex'
import { getConfig, loadConfig } from './config'
import { generateHash } from './hash-schema'
import jsonSchemaOutput, { JSONSchemaOptions } from './json-schema-output'
import { karhu } from './karhu'
import mongooseOutput, { MongooseOutputOptions } from './mongoose-output'
import nowToken from './now'
import { ObjectId as ObjectIdType } from './object-id'
import { Schema as SchemaType } from './schema'
import tsOutput, { TSOptions } from './ts-output'
import typeGraphQLOutput, { TypeGraphQLOptions } from './typeGraphQLOutput'

export const ObjectId = ObjectIdType
export type Schema = SchemaType
export const Complex = ComplexType
export const now = nowToken
const log = karhu('schematar-api')

loadConfig()

export type MongooseOutputOptionsWithOptionalContext = Omit<MongooseOutputOptions, 'context'> & {
  context?: string
}

export function createMongooseSchema(
  schema: Schema,
  contextOrOptions: MongooseOutputOptionsWithOptionalContext | string = 'mongoose'
) {
  const options =
    typeof contextOrOptions === 'string'
      ? { context: contextOrOptions }
      : { ...contextOrOptions, context: contextOrOptions.context ?? 'mongoose' }
  return mongooseOutput(schema, options)
}

export function createTypescriptInterfaceDefinition(
  exportName: string,
  schema: Schema | ComplexType,
  context = 'typescript',
  options: TSOptions = {}
) {
  return tsOutput(exportName, schema, context, options)
}

export function createTypeGraphQLClasses(
  baseName: string,
  schema: Schema | ComplexType,
  context = 'type-graphql',
  options: TypeGraphQLOptions = {}
) {
  return typeGraphQLOutput(baseName, schema, context, options)
}

export function createJSONSchema(schema: Schema, context = 'jsonschema', options: JSONSchemaOptions = {}) {
  return jsonSchemaOutput(schema, context, options)
}

export async function createTypescriptInterfaceFiles(
  sourceFileGlobs: string | string[],
  outputPath: string,
  logCreations = false
) {
  await createFromFiles(sourceFileGlobs, outputPath, createTSInterfaceFile, logCreations)
}

export async function createTypeGraphQLClassFiles(
  sourceFileGlobOrFileArray: string | string[],
  outputPath: string,
  logCreations = false
) {
  await createFromFiles(sourceFileGlobOrFileArray, outputPath, createTypeGraphQLClassFile, logCreations)
}

async function createFromFiles(
  sourceFileGlobs: string | string[],
  outputPath: string,
  createFn: (file: string, outputPath: string, logCreations: boolean) => Promise<void>,
  logCreations: boolean
) {
  const { default: glob } = await import('glob')
  const pathsRelativeTo = getConfig().pathsRelativeTo
  const actualOutputDirectory = path.resolve(pathsRelativeTo, outputPath)
  await mkdirp(actualOutputDirectory)
  const globArray = Array.isArray(sourceFileGlobs) ? sourceFileGlobs : [sourceFileGlobs]
  const cwd = pathsRelativeTo
  const files = [].concat(...globArray.map((f) => glob.sync(f, { cwd })))
  for (const file of files) {
    await createFn(file, actualOutputDirectory, logCreations)
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

export interface SchemaFile {
  name?: string
  default?: Schema
  schema?: Schema
  typescriptSchemas?: TypescriptSchemaDefinition[]
  typeGraphQLSchemas?: Array<TypeGraphQLOptions & { schema: Schema; name?: string; context?: string }>
}

export async function createTSInterfaceFile(
  filename: string,
  outputPath: string,
  logCreations = true,
  formatOutputFilename = defaultOutputFilenameFormatter
) {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
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

  if (exported.length) {
    if (logCreations) {
      log.info('Storing typescript interfaces in', outputFilename)
    }

    await new Promise<void>((resolve, reject) =>
      fs.writeFile(outputFilename, exported.join('\n'), 'utf8', (err) => (!err ? resolve() : reject(err)))
    )
  }
}

export async function createTypeGraphQLClassFile(
  filename: string,
  outputPath: string,
  logCreations = true,
  formatOutputFilename = defaultOutputFilenameFormatterTGQL,
  globalOptions?: TypeGraphQLOptions
) {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const schemaFile = require(path.resolve(filename)) as SchemaFile
  const topLevelSchema = schemaFile.schema || schemaFile.default
  const topLevelName = schemaFile.name || pickNameFromFilename(filename)
  const exported: string[] = []
  if (schemaFile.typeGraphQLSchemas) {
    const optionSets = schemaFile.typeGraphQLSchemas
    for (const optionSet of optionSets) {
      const schema = optionSet.schema || topLevelSchema,
        name = optionSet.name || topLevelName

      if (!schema) throw new Error('No schema found for ' + name)
      exported.push(createTypeGraphQLClasses(name, schema, optionSet.context || 'type-graphql', optionSet))
    }
  } else if (topLevelSchema) {
    exported.push(createTypeGraphQLClasses(topLevelName, topLevelSchema))
  }
  const outputFilename = path.join(outputPath, formatOutputFilename(filename))

  if (exported.length) {
    if (logCreations) {
      log.info('Storing type-graphql classes in', outputFilename)
    }

    await new Promise<void>((resolve, reject) =>
      fs.writeFile(outputFilename, exported.join('\n'), 'utf8', (err) => (!err ? resolve() : reject(err)))
    )
  }
}

function defaultOutputFilenameFormatter(inputFilename: string) {
  const ext = path.extname(inputFilename),
    basename = path.basename(inputFilename, ext)

  return basename + '.schematar.ts'
}

function defaultOutputFilenameFormatterTGQL(inputFilename: string) {
  const ext = path.extname(inputFilename),
    basename = path.basename(inputFilename, ext)

  return basename + '.tgql.schematar.ts'
}

function pickNameFromFilename(filename: string) {
  const fn = path.basename(filename, path.extname(filename))
  return (fn[0].toUpperCase() + fn.substring(1))
    .replace(/[-_][a-z]/g, (match) => match[1].toUpperCase())
    .replace(/[^a-zA-Z0-9]/g, '')
}

export function hashSchema(schema: Schema | ComplexType) {
  return generateHash(schema)
}
