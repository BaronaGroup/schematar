import {Schema, DefaultContext, SchemaFields, FieldInfo, Field, PlainType} from './schema'
import Complex from './complex'
import now from './now'
import {ObjectId} from './object-id'
import {ObjectId as MongoObjectId} from 'mongodb'
import mongoose from 'mongoose'

export interface MongooseFields {
  [key: string]: MongooseField
}

interface MongooseField {
  type: any,
  index?: boolean
  unique?: boolean
  sparse?: boolean
  enum?: any[]
  ref?: string
  default?: any
  expires?: string
}

export type MongooseTypeBase = { type: any} | { plain: any}

export default function (schema: Schema, context: string = 'mongoose') {
  return outputFields(schema.fields, context)
}

export function outputFields(fields: SchemaFields, context: string): MongooseFields {
  const outFields: MongooseFields = {}
  for (const [key, field1] of Object.entries(fields)) {
    const field = field1 as Field
    const presentIn: string[] | undefined = (field as any).presentIn
    if (presentIn && !presentIn.includes(context)) continue

    if (key === '_id' || key === '__v') continue
    outFields[key] = outputFieldFormat(field, context)
  }
  return outFields
}

function outputFieldFormat(field: Field, context: string): MongooseField {
  if (isFullDeclaration(field)) {

    const typeBase: MongooseTypeBase = asMongooseTypeBase(field, context)

    if (!('type' in typeBase)) {
      return typeBase.plain
    }
    const outField: MongooseField = {...typeBase}
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
    return omitUndefined(outField)
  } else {
    const typeBase = asMongooseTypeBase({type: field}, context)
    if ('type' in typeBase) return typeBase
    return typeBase.plain
  }
}

function asMongooseTypeBase<Context>(field: FieldInfo, context: string): MongooseTypeBase {
  const {type} = field
  if (type === ObjectId) return {type: mongoose.Schema.Types.ObjectId}
  if (type === String) return {type}
  if (type === Boolean) return {type}
  if (type === Number) return {type}
  if (type === Object) return {type}
  if (type === Date) return {type}

  if (Complex.isComplex(type)) {
    return type.outputMongoose(context, field)

  }
  if (type instanceof Array) {
    return {
      type: type.map(subtype => {
        return outputFieldFormat(subtype, context)
      })
    }
  }
  throw new Error('Unsupported type for mongoose schema ' + JSON.stringify(type))
}

function isFullDeclaration<Context>(field: Field): field is FieldInfo {
  return !!(field as any).type
}

function* yieldMany<T>(items: T[]): IterableIterator<T> {
  for (const item of items) yield item
}

function omitUndefined<T extends object>(obj: T): T {
  const out: any = {}
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) out[key] = value
  }
  return out as T
}
