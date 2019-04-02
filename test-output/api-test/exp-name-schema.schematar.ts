// Generated file, do not edit!

// tslint:disable array-type
// @ts-ignore -- ignore possibly unused type parameters
export interface CustomNameBase<IDType, DateType> {
  field: string
}
import {ObjectId} from 'mongodb'
export type CustomNameMongoose = CustomNameBase<ObjectId, Date>
export type CustomNameJSON = CustomNameBase<string, string>
export type CustomNameFluid = CustomNameBase<string | ObjectId, string | Date>