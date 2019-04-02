// Generated file, do not edit!

// tslint:disable array-type
// @ts-ignore -- ignore possibly unused type parameters
export interface ExpContextSchemaBase<IDType, DateType> {
  field1: string
  field2?: string
  field3: string
  field4: string
}
import {ObjectId} from 'mongodb'
export type ExpContextSchemaMongoose = ExpContextSchemaBase<ObjectId, Date>
export type ExpContextSchemaJSON = ExpContextSchemaBase<string, string>
export type ExpContextSchemaFluid = ExpContextSchemaBase<string | ObjectId, string | Date>