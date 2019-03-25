import Complex from './complex'
import {ObjectId} from './object-id'

export type DefaultContext = 'mongoose' | 'typescript' | 'jsonschema'

export interface Schema {
    fields: SchemaFields
}

type SimpleType = symbol | Complex | typeof String | typeof Number | typeof Boolean | typeof Date | typeof Object | typeof ObjectId
type IndexOptions = false | true | 'unique' | 'unique-sparse'

export type PlainType = SimpleType | Array<FieldInfo | SimpleType>

export type Field = FieldInfo | PlainType

export interface FieldInfo {
    type: PlainType
    index?: IndexOptions
    format?: any
    optional?: boolean
    allowNull?: boolean
    presentIn?: string[]
    optionalIn?: string[]
    enum?: string[]
    mongooseDefault?: any
    mongooseRef?: string
    mongooseExpires?: string
}

export interface SchemaFields {
    [name: string]: Field
}
