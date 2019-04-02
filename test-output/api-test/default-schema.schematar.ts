// Generated file, do not edit!

// tslint:disable array-type
// @ts-ignore -- ignore possibly unused type parameters
export interface DefaultSchemaBase<IDType, DateType> {
  field: string
}
import {ObjectId} from 'mongodb'
export type DefaultSchemaMongoose = DefaultSchemaBase<ObjectId, Date>
export type DefaultSchemaJSON = DefaultSchemaBase<string, string>
export type DefaultSchemaFluid = DefaultSchemaBase<string | ObjectId, string | Date>