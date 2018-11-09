import ObjectId from './object-id'
import Complex from './complex'

export type DefaultContext = 'mongoose' | 'typescript' | 'jsonschema'

export interface Schema<Context = DefaultContext> {
    fields: SchemaFields<Context>
}

type SimpleType<Context> = Symbol | Complex<Context> | typeof String | typeof Number | typeof Boolean | typeof Date
type IndexOptions = false | true | 'unique' | 'unique-sparse'

export type PlainType<Context> = SimpleType<Context> | [FieldInfo<Context> | SimpleType<Context>]

export type Field<Context> = FieldInfo<Context> | PlainType<Context>

export interface FieldInfo<Context> {
    type: PlainType<Context>
    index?: IndexOptions
    format?: any
    optional?: boolean
    presentIn?: Array<Context>
    optionalIn?: Array<Context>
}

export interface SchemaFields<Context = DefaultContext> {
    [name: string]: Field<Context>
}