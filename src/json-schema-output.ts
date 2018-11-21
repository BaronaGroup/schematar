import {Schema, SchemaFields, FieldInfo, Field, PlainType} from './schema'
import ObjectId from './object-id'
import Complex from './complex'


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

type JSONSchemaProperty = JSONSchemaSimpleProperty | JSONSchemaObjectProperty | JSONSchemaStringProperty | JSONSchemaArrayProperty

interface JSONSchemaProperties {
    [key: string]: JSONSchemaProperty
}

interface JSONSchemaObjectProperty {
    type: 'object'
    properties: JSONSchemaProperties
    required: string[],
    additionalProperties: boolean
}

interface JSONSchema extends JSONSchemaObjectProperty {
    $id: string
    $schema: 'http://json-schema.org/draft-07/schema#'
}

export default function(exportName: string, schema: Schema, allowAdditionalFields: boolean, context: string = 'jsonschema') {
    const output: string[] = []
    const base: JSONSchema = {
        $id: exportName,
        type: 'object',
        $schema: 'http://json-schema.org/draft-07/schema#',
        properties: {},
        required: [],
        additionalProperties: allowAdditionalFields
    }

    outputFields(schema.fields, context, base)

    return `export const ${exportName} = ${JSON.stringify(base, null, 2)}`
}

function outputFields(fields: SchemaFields, context: string, schema: JSONSchemaObjectProperty) {
    for (const key of Object.keys(fields)) {
        const field = fields[key]
        const presentIn: string[] | undefined = (field as any).presentIn
        if (presentIn && !presentIn.includes(context)) continue

        schema.properties[key] = outputFieldFormat(field, context)
        const optional = isOptional(field, context)
        if (!optional) schema.required.push(key)
    }
}

function isOptional(field: any, context: string) {
    if (!field.type) return false
    const fi = field as FieldInfo
    return fi.optional || (fi.optionalIn && fi.optionalIn.includes(context))

}

function outputFieldFormat(field: Field, context: string) {
    if (isFullDeclaration(field)) {
        if (field.enum && field.type !== String) throw new Error('Enum is only supported for strings')
        const prop = asJSONSchemaProperty(field.type, context)
        if (field.enum) (prop as JSONSchemaStringProperty).enum = field.enum
        return prop

    } else {
        return asJSONSchemaProperty(field, context)
    }
}

function asJSONSchemaProperty(type: PlainType, context: string): JSONSchemaProperty {
    if (type === ObjectId) return {type: 'string', pattern: '^[a-fA-F0-9]{24}$'}
    if (type === String) return {type: 'string'}
    if (type === Date) return {type: 'string', pattern: /^\d\d-\d\d-\d\d\d\dT\d\d:\d\d:\d\d\.\d\d\d(Z|[+-]\d\d:?\d\d)$/}
    if (type instanceof Complex) {
        const subschema: JSONSchemaObjectProperty = {
            type: 'object',
            required: [],
            properties: {},
            additionalProperties: false
        }
        outputFields(type.subschema, context, subschema)
        return subschema
    }
    if (type instanceof Array) {
        const outtype = outputFieldFormat(type[0], context)
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
