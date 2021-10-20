import Complex from './complex'
import { ObjectId } from './object-id'

export type DefaultContext = 'mongoose' | 'typescript' | 'jsonschema'

export interface Schema {
  fields: SchemaFields
}

type SimpleType =
  | Complex
  | typeof String
  | typeof Number
  | typeof Boolean
  | typeof Date
  | typeof Object
  | typeof ObjectId
  | Schema // tslint:disable-line:ban-types
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
  mongoose?: any
  mongooseDefault?: any
  mongooseRef?: string
  mongooseExpires?: string
  jsonSchema?: any
}

export interface SchemaFields {
  [name: string]: Field
}

export function isFullDeclaration(field: Field): field is FieldInfo {
  return !!(field as any).type
}

export function isSchema(potentialSchema: any): potentialSchema is Schema {
  return typeof potentialSchema === 'object' && Object.keys(potentialSchema).length === 1 && 'fields' in potentialSchema
}
