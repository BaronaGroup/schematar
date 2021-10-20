import Complex from './complex'
import { getMongoose } from './mongoose-storage'
import now from './now'
import { ObjectId } from './object-id'
import { Field, FieldInfo, Schema, SchemaFields, isSchema } from './schema'

export interface MongooseOutputOptions {
  context: string
  transformer?(input: MongooseField, path: string[], schematarType: Field): MongooseField | undefined
  _fieldPath?: string[] // internal use only
}

export interface MongooseFields {
  [key: string]: MongooseField
}

interface MongooseField {
  type: any
  index?: boolean
  unique?: boolean
  sparse?: boolean
  enum?: any[]
  ref?: string
  default?: any
  expires?: string
}

export type MongooseTypeBase = { type: any } | { plain: any }

export default function (schema: Schema, options: MongooseOutputOptions) {
  return outputFields(schema.fields, options)
}

export function outputFields(fields: SchemaFields, options: MongooseOutputOptions): MongooseFields {
  const outFields: MongooseFields = {}
  for (const [key, field1] of Object.entries(fields)) {
    const field = field1 as Field
    const presentIn: string[] | undefined = (field as any).presentIn
    if (presentIn && !presentIn.includes(options.context)) continue

    if (key === '_id' || key === '__v') continue
    const fieldPath = [...(options._fieldPath ?? []), key]
    const fieldFormat = outputFieldFormat(field, { ...options, _fieldPath: fieldPath })
    const transformedFieldFormat = options.transformer?.(fieldFormat, fieldPath, field) ?? fieldFormat
    outFields[key] = transformedFieldFormat
  }
  return outFields
}

function outputFieldFormat(field: Field, options: MongooseOutputOptions): MongooseField {
  if (isFullDeclaration(field)) {
    const typeBase: MongooseTypeBase = asMongooseTypeBase(field, options)

    if (!('type' in typeBase)) {
      return typeBase.plain
    }
    const outField: MongooseField = { ...typeBase }
    if (field.index === true) {
      outField.index = true
    } else if (field.index === 'unique') {
      outField.unique = true
    } else if (field.index === 'unique-sparse') {
      outField.unique = true
      outField.sparse = true
    }
    outField.enum = field.enum

    if (field.mongooseDefault !== undefined) {
      if (field.mongooseDefault === now) {
        outField.default = Date.now
      } else {
        outField.default = field.mongooseDefault
      }
    }
    if (field.mongooseRef) {
      outField.ref = field.mongooseRef
    }
    if (field.mongooseExpires) {
      outField.expires = field.mongooseExpires
    }
    if (field.mongoose) Object.assign(outField, field.mongoose)
    return omitUndefined(outField)
  } else {
    const typeBase = asMongooseTypeBase({ type: field }, options)
    if ('type' in typeBase) return typeBase
    return typeBase.plain
  }
}

function asMongooseTypeBase(field: FieldInfo, options: MongooseOutputOptions): MongooseTypeBase {
  const { type } = field

  if (type === ObjectId) return { type: getMongooseImpl().Schema.Types.ObjectId }
  if (type === String) return { type }
  if (type === Boolean) return { type }
  if (type === Number) return { type }
  if (type === Object) return { type }
  if (type === Date) return { type }

  if (Complex.isComplex(type)) {
    return type.outputMongoose(options, field)
  }
  if (type instanceof Array) {
    return {
      type: type.map((subtype) => {
        return outputFieldFormat(subtype, options)
      }),
    }
  }
  if (isSchema(type)) {
    const asComplex = new Complex(type.fields)
    return asComplex.outputMongoose(options, { ...field, type: asComplex })
  }
  throw new Error('Unsupported type for mongoose schema ' + JSON.stringify(type))
}

function isFullDeclaration(field: Field): field is FieldInfo {
  return !!(field as any).type
}

function omitUndefined<T extends object>(obj: T): T {
  const out: any = {}
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) out[key] = value
  }
  return out as T
}

function getMongooseImpl() {
  const mongoose = getMongoose()
  if (!mongoose) {
    throw new Error(
      "Schematar: mongoose not passed to schematar. You have to do something along the lines of\nimport * as mongoose from 'mongoose'\nimport { setMongoose } from 'schematar'\nsetMongoose(mongoose)"
    )
  }

  return mongoose
}
