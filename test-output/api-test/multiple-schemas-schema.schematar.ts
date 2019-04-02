// Generated file, do not edit!

// tslint:disable array-type
// @ts-ignore -- ignore possibly unused type parameters
export interface MultipleSchemasSchemaBase<IDType, DateType> {
  field: string
}
import {ObjectId} from 'mongodb'
export type MultipleSchemasSchemaMongoose = MultipleSchemasSchemaBase<ObjectId, Date>
export type MultipleSchemasSchemaJSON = MultipleSchemasSchemaBase<string, string>
export type MultipleSchemasSchemaFluid = MultipleSchemasSchemaBase<string | ObjectId, string | Date>
// Generated file, do not edit!

// tslint:disable array-type
// @ts-ignore -- ignore possibly unused type parameters
export interface AlternativeBase<IDType, DateType> {
  another: number
}
export type AlternativeMongoose = AlternativeBase<ObjectId, Date>
export type AlternativeJSON = AlternativeBase<string, string>
export type AlternativeFluid = AlternativeBase<string | ObjectId, string | Date>
export const anotherHash = '5769d7ffccddeec74191da4ca235bf7efb58994cb7635815af5d02ae8008c610'
// Generated file, do not edit!

// tslint:disable array-type
// @ts-ignore -- ignore possibly unused type parameters
export interface FinalBase<IDType, DateType> {
  field: string
  finalField: string
}
export type FinalMongoose = FinalBase<ObjectId, Date>
export type FinalJSON = FinalBase<string, string>
export type FinalFluid = FinalBase<string | ObjectId, string | Date>