import ObjectId from './object-id'
import Complex from './complex'

export type DefaultContext = 'mongoose' | 'typescript' | 'jsonschema'

export interface Schema {
    fields: SchemaFields
}

type SimpleType = Symbol | Complex | typeof String | typeof Number | typeof Boolean | typeof Date | typeof Object
type IndexOptions = false | true | 'unique' | 'unique-sparse'

export type PlainType = SimpleType | [FieldInfo | SimpleType]

export type Field = FieldInfo | PlainType

export interface FieldInfo {
    type: PlainType
    index?: IndexOptions
    format?: any
    optional?: boolean
    presentIn?: Array<string>
    optionalIn?: Array<string>
    enum?: string[]
    mongooseDefault?: any
    mongooseRef?: string
}

export interface SchemaFields {
    [name: string]: Field
}
