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

export default function (schema: Schema, context: string = 'mongoose') {
  return outputFields(schema.fields, context)
}

function outputFields(fields: SchemaFields, context: string): MongooseFields {
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
    const outField: MongooseField = {
      type: asMongooseType(field.type, context)
    }
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
    return {type: asMongooseType(field, context)}
  }
}

function asMongooseType<Context>(type: PlainType, context: string): any {
  if (type === ObjectId) return mongoose.Schema.Types.ObjectId
  if (type === String) return type
  if (type === Boolean) return type
  if (type === Number) return type
  if (type === Object) return type
  if (type === Date) return type

  if (type instanceof Complex) {
    return outputFields(type.subschema, context)
  }
  if (type instanceof Array) {
    return type.map(subtype => outputFieldFormat(subtype, context).type)
  }
  throw new Error('Unsupported type for mongoose schema ' + type)
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
