import Complex from './complex'
import { generateHash } from './hash-schema'
import { ObjectId } from './object-id'
import {
  DefaultContext,
  Field,
  FieldInfo,
  PlainType,
  Schema,
  SchemaFields,
  isFullDeclaration,
  isSchema,
} from './schema'

export interface TSOptions {
  omitExtraExports?: boolean
  exportHash?: string
  doNotImportObjectId?: boolean
  doNotImportMongooseTypes?: boolean
  typescriptVersion?: string // the version of typescript the generated interface are to be compatible with. "detect" attempts to detect a suitable version from the working directory, "latest" and undefined use all features
}

export default function (
  exportName: string,
  schema: Schema | Complex,
  context: string = 'typescript',
  options: TSOptions = {}
) {
  const output: string[] = []
  output.push('// Generated file, do not edit!')
  output.push('')
  output.push('// tslint:disable')
  output.push('/* eslint-disable */')
  output.push('// @ts-ignore -- ignore possibly unused type parameters')
  output.push(`export interface ${exportName}Base<IDType, DateType>`)
  if (Complex.isComplex(schema)) {
    output.push(schema.outputTypescript(context, '  ', null))
  } else {
    output.push('{')
    for (const field of outputFields(schema.fields, context, '  ')) {
      output.push(field)
    }
    output.push('}')
  }
  if (!options.omitExtraExports) {
    if (!options.doNotImportObjectId) {
      output.push(`import {ObjectId} from 'mongodb'`)
    }
    if (!options.doNotImportMongooseTypes) {
      output.push(`import {Types as MongooseTypes} from 'mongoose'`)
    }
    output.push(`export type ${exportName}Mongoose = ${exportName}Base<ObjectId, Date>`)
    output.push(`export type ${exportName}JSON = ${exportName}Base<string, string>`)
    output.push(`export type ${exportName}Fluid = ${exportName}Base<string | ObjectId, string | Date>`)
  }
  const { exportHash } = options
  if (exportHash) {
    const hash = generateHash(Complex.isComplex(schema) ? { fields: schema.subschema } : schema)
    output.push(`export const ${exportHash} = '${hash}'`)
  }

  return output.join('\n')
}

export function* outputFields(fields: SchemaFields, context: string, indentation: string): IterableIterator<string> {
  for (const key of Object.keys(fields)) {
    const field = fields[key]
    const presentIn: string[] | undefined = (field as any).presentIn
    if (presentIn && !presentIn.includes(context)) continue

    const ftm = outputFieldFormat(field, context, indentation)
    const optional = isOptional(field, context)
    const allowNull = (field as any).allowNull
    if (allowNull && !optional) throw new Error('allowNull can only be used on optional fields')

    if (versionAtLeast('4.3')) {
      const type = isFullDeclaration(field) ? field.type : field
      if (type === ObjectId) {
        yield get
        return
      }
    }

    yield `${indentation}${key}${optional ? '?' : ''}: ${ftm}${allowNull ? ' | null' : ''}`
  }
}

function isOptional<Context>(field: any, context: string) {
  if (!field.type) return false
  const fi = field as FieldInfo
  return fi.optional || (fi.optionalIn && fi.optionalIn.includes(context))
}

function outputFieldFormat(field: Field, context: string, indentation: string) {
  if (isFullDeclaration(field)) {
    if (field.enum) {
      return field.enum.map((f) => "'" + f.replace(/'/g, "\\'") + "'").join(' | ')
    } else {
      return asTSType(field, context, indentation)
    }
  } else {
    return asTSType({ type: field }, context, indentation)
  }
}

function asTSType<Context>(field: FieldInfo, context: string, indentation: string): string {
  const { type } = field
  if (type === ObjectId) return 'IDType'
  if (type === String) return 'string'
  if (type === Date) return 'DateType'
  if (type === Boolean) return 'boolean'
  if (type === Number) return 'number'
  if (type === Object) return 'any'

  if (Complex.isComplex(type)) {
    return type.outputTypescript(context, indentation, field)
  }
  if (type instanceof Array) {
    // TODO: support complex types
    const output = [...outputFieldFormat(type[0], context, indentation)].join('\n')
    return 'Array<' + output + '>'
  }
  if (isSchema(type)) {
    const asComplex = new Complex(type.fields)
    return asComplex.outputTypescript(context, indentation, { ...field, type: asComplex })
  }
  throw new Error('Unsupported type for typescript type ' + type)
}

function* yieldMany<T>(items: T[]): IterableIterator<T> {
  for (const item of items) yield item
}
