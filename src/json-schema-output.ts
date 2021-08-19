import Complex from './complex'
import { ObjectId } from './object-id'
import { Field, FieldInfo, PlainType, Schema, SchemaFields, isSchema } from './schema'

const datePatternTmp = /^\d\d\d\d-\d\d-\d\dT\d\d:\d\d:\d\d\.\d\d\d(Z|[+-]\d\d:?\d\d)$/.toString()
const datePattern = datePatternTmp.substring(1, datePatternTmp.length - 1)

interface JSONSchemaSimpleProperty {
  type: string
}

interface JSONSchemaArrayProperty {
  type: string
  items: JSONSchemaProperty
}

interface JSONSchemaStringProperty {
  type: 'string'
  pattern?: string
  enum?: string[]
}

interface JSONSchemaAnyProperty {}

interface JSONSchemaMultiTypeProperty {
  type: string[]
}

export type JSONSchemaProperty =
  | JSONSchemaSimpleProperty
  | JSONSchemaObjectProperty
  | JSONSchemaStringProperty
  | JSONSchemaArrayProperty
  | JSONSchemaAnyProperty
  | JSONSchemaMultiTypeProperty

interface JSONSchemaProperties {
  [key: string]: JSONSchemaProperty
}

export interface JSONSchemaObjectProperty {
  type: 'object'
  properties: JSONSchemaProperties
  required: string[]
  additionalProperties: boolean
}

export interface JSONSchema extends JSONSchemaObjectProperty {
  $id: string
  $schema: 'http://json-schema.org/draft-07/schema#'
}

export interface JSONSchemaOptions {
  makeEverythingOptional?: boolean
  allowAdditionalFields?: boolean
  allowAdditionalFieldsNested?: boolean
  schemaId?: string
}

export default function (schema: Schema, context: string = 'jsonschema', options: JSONSchemaOptions = {}) {
  const output: string[] = []
  const base: JSONSchema = {
    $id: options.schemaId,
    type: 'object',
    $schema: 'http://json-schema.org/draft-07/schema#',
    properties: {},
    required: [],
    additionalProperties: options.allowAdditionalFields || options.allowAdditionalFieldsNested,
  }

  outputFields(schema.fields, context, base, options)

  return base
}

export function outputFields(
  fields: SchemaFields,
  context: string,
  schema: JSONSchemaObjectProperty,
  options: JSONSchemaOptions
) {
  for (const key of Object.keys(fields)) {
    const field = fields[key]
    const presentIn: string[] | undefined = (field as any).presentIn
    if (presentIn && !presentIn.includes(context)) continue

    schema.properties[key] = outputFieldFormat(field, context, options)
    const optional = options.makeEverythingOptional || isOptional(field, context)
    if (!optional) schema.required.push(key)
  }
}

function isOptional(field: any, context: string) {
  if (!field.type) return false
  const fi = field as FieldInfo
  return fi.optional || (fi.optionalIn && fi.optionalIn.includes(context))
}

function outputFieldFormat(field: Field, context: string, options: JSONSchemaOptions): JSONSchemaProperty {
  if (isFullDeclaration(field)) {
    if (field.enum && field.type !== String && !(Array.isArray(field.type) && field.type[0] === String)) {
      throw new Error('Enum is only supported for strings')
    }
    const prop = asJSONSchemaProperty(field, context, options)
    if (field.enum && !Array.isArray(field.type)) {
      // tslint:disable-next-line
      ;(prop as JSONSchemaStringProperty).enum = field.enum
    }
    if (field.jsonSchema) Object.assign(prop, field.jsonSchema)
    if (field.allowNull) {
      const chosenType = (prop as any).type
      if (typeof chosenType !== 'string') throw new Error('Cannot use allowNull when base type is an array')
      return {
        ...prop,
        type: [chosenType, 'null'],
        ...(field.jsonSchema || {}),
      }
    }
    return prop
  } else {
    return asJSONSchemaProperty({ type: field }, context, options)
  }
}

function asJSONSchemaProperty(field: FieldInfo, context: string, options: JSONSchemaOptions): JSONSchemaProperty {
  const { type } = field
  if (type === ObjectId) return { type: 'string', pattern: '^[a-fA-F0-9]{24}$' }
  if (type === String) return { type: 'string' }
  if (type === Date) {
    return { type: 'string', pattern: datePattern }
  }
  if (type === Boolean) return { type: 'boolean' }
  if (type === Number) return { type: 'number' }
  if (type === Object) return {}
  if (Complex.isComplex(type)) {
    return type.outputJSONSchema(context, options, field)
  }

  if (type instanceof Array) {
    const outtype = outputFieldFormat(type[0], context, options)
    const subschema: JSONSchemaArrayProperty = {
      type: 'array',
      items: {
        ...outtype,
        ...(field.enum ? { enum: field.enum } : {}),
      },
    }
    return subschema
  }
  if (isSchema(type)) {
    return new Complex(type.fields).outputJSONSchema(context, options, field)
  }
  throw new Error('Unsupported type for json-schema ' + type)
}

function isFullDeclaration<Context>(field: Field): field is FieldInfo {
  return !!(field as any).type
}

function* yieldMany<T>(items: T[]): IterableIterator<T> {
  for (const item of items) yield item
}
