import {Field, isFullDeclaration, PlainType, Schema, SchemaFields} from './schema'
import {ObjectId} from './object-id'
import Complex from './complex'
import crypto from 'crypto'

export function generateHash(schema: Schema) {
  const string = [...fieldsToStrings(schema.fields)].join('\n')
  return hashString(string)
}

function* fieldsToStrings(fields: SchemaFields): IterableIterator<string> {
  for (const [name, field] of Object.entries(fields)) {
    yield name
    if (isFullDeclaration(field)) {
      yield 'F'
      yield* getTypeString(field.type)
      yield field.enum ? enumToString(field.enum) : ''
      yield field.allowNull ? 'N' : 'R'
      yield (field.optionalIn || []).join(',')
      yield field.optional ? 'O' : 'R'
      yield (field.presentIn || []).join(',')
    } else {
      yield 'T'
      yield* getTypeString(field)
    }
  }
}

function* getTypeString(type: PlainType) {
  if (type === ObjectId) return yield 'ObjectId'
  if (type === String) return yield 'string'
  if (type === Date) return yield 'DateType'
  if (type === Boolean) return yield 'boolean'
  if (type === Number) return yield 'number'
  if (type === Object) return yield 'any'

  if (type instanceof Complex) {
    yield 'Complex{'
    yield* fieldsToStrings(type.subschema)
    yield '}'
  } else if (type instanceof Array) {
    yield 'Array['
    yield* fieldsToStrings({item: type[0]})
    yield ']'
  }
}

function enumToString(enumValues: any[]) {
  return enumValues.map((e: any) => e.toString()).join(',')
}

function hashString(str: string) {
  return crypto.createHash('sha256').update(str).digest('hex')
}
