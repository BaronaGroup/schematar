import {Schema, SchemaFields, FieldInfo, Field, PlainType} from './schema'
import Complex from './complex'
import {ObjectId} from './object-id'

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
    pattern?: string,
    enum?: string[]
}

interface JSONSchemaAnyProperty {

}

interface JSONSchemaMultiTypeProperty {
    type: string[]
}

export type JSONSchemaProperty = JSONSchemaSimpleProperty | JSONSchemaObjectProperty | JSONSchemaStringProperty | JSONSchemaArrayProperty | JSONSchemaAnyProperty | JSONSchemaMultiTypeProperty

interface JSONSchemaProperties {
    [key: string]: JSONSchemaProperty
}

interface JSONSchemaObjectProperty {
    type: 'object'
    properties: JSONSchemaProperties
    required: string[],
    additionalProperties: boolean
}

export interface JSONSchema extends JSONSchemaObjectProperty {
    $id: string
    $schema: 'http://json-schema.org/draft-07/schema#'
}

export interface JSONSchemaOptions {
    makeEverythingOptional?: boolean
    allowAdditionalFields?: boolean
    schemaId?: string
}

export default function(schema: Schema, context: string = 'jsonschema', options: JSONSchemaOptions = {}) {
    const output: string[] = []
    const base: JSONSchema = {
        $id: options.schemaId,
        type: 'object',
        $schema: 'http://json-schema.org/draft-07/schema#',
        properties: {},
        required: [],
        additionalProperties: options.allowAdditionalFields
    }

    outputFields(schema.fields, context, base, !!options.makeEverythingOptional)

    return base
}

function outputFields(fields: SchemaFields, context: string, schema: JSONSchemaObjectProperty, makeEverythingOptional: boolean) {
    for (const key of Object.keys(fields)) {
        const field = fields[key]
        const presentIn: string[] | undefined = (field as any).presentIn
        if (presentIn && !presentIn.includes(context)) continue

        schema.properties[key] = outputFieldFormat(field, context, makeEverythingOptional)
        const optional = makeEverythingOptional || isOptional(field, context)
        if (!optional) schema.required.push(key)
    }
}

function isOptional(field: any, context: string) {
    if (!field.type) return false
    const fi = field as FieldInfo
    return fi.optional || (fi.optionalIn && fi.optionalIn.includes(context))

}

function outputFieldFormat(field: Field, context: string, makeEverythingOptional: boolean) {
    if (isFullDeclaration(field)) {
        if (field.enum && field.type !== String) throw new Error('Enum is only supported for strings')
        const prop = asJSONSchemaProperty(field.type, context, makeEverythingOptional)
        if (field.enum) (prop as JSONSchemaStringProperty).enum = field.enum
        if (field.allowNull) {
            const chosenType = (prop as any).type
            if (typeof chosenType !== 'string') throw new Error('Cannot use allowNull when base type is an array')
            return {
                ...prop,
                type: [chosenType, 'null']
            }
        }
        return prop

    } else {
        return asJSONSchemaProperty(field, context, makeEverythingOptional)
    }
}

function asJSONSchemaProperty(type: PlainType, context: string, makeEverythingOptional: boolean): JSONSchemaProperty {
    if (type === ObjectId) return {type: 'string', pattern: '^[a-fA-F0-9]{24}$'}
    if (type === String) return {type: 'string'}
    if (type === Date) {
        return {type: 'string', pattern: datePattern}
    }
    if (type === Boolean) return {type: 'boolean'}
    if (type === Number) return {type: 'number'}
    if (type === Object) return {}
    if (type instanceof Complex) {
        const subschema: JSONSchemaObjectProperty = {
            type: 'object',
            required: [],
            properties: {},
            additionalProperties: false
        }
        outputFields(type.subschema, context, subschema, makeEverythingOptional)
        return subschema
    }
    if (type instanceof Array) {
        const outtype = outputFieldFormat(type[0], context, makeEverythingOptional)
        const subschema: JSONSchemaArrayProperty = {
            type: 'array',
            items: outtype
        }
        return subschema
    }
    throw new Error('Unsupported type for json-schema ' + type)
}

function isFullDeclaration<Context>(field: Field): field is FieldInfo {
    return !!(field as any).type
}

function* yieldMany<T>(items: T[]): IterableIterator<T> {
    for (const item of items) yield item
}
