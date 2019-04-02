// Generated file, do not edit!

// tslint:disable array-type
// @ts-ignore -- ignore possibly unused type parameters
export interface SimpleSchemaBase<IDType, DateType> {
  field: string
}
import {ObjectId} from 'mongodb'
export type SimpleSchemaMongoose = SimpleSchemaBase<ObjectId, Date>
export type SimpleSchemaJSON = SimpleSchemaBase<string, string>
export type SimpleSchemaFluid = SimpleSchemaBase<string | ObjectId, string | Date>