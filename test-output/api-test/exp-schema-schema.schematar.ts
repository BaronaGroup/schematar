// Generated file, do not edit!

// tslint:disable array-type
// @ts-ignore -- ignore possibly unused type parameters
export interface ExpSchemaSchemaBase<IDType, DateType> {
  altField: number
}
import {ObjectId} from 'mongodb'
export type ExpSchemaSchemaMongoose = ExpSchemaSchemaBase<ObjectId, Date>
export type ExpSchemaSchemaJSON = ExpSchemaSchemaBase<string, string>
export type ExpSchemaSchemaFluid = ExpSchemaSchemaBase<string | ObjectId, string | Date>