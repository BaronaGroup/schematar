// Generated file, do not edit!

// tslint:disable array-type
// @ts-ignore -- ignore possibly unused type parameters
export interface BananaBase<IDType, DateType> {
  field: string
}
import {ObjectId} from 'mongodb'
export type BananaMongoose = BananaBase<ObjectId, Date>
export type BananaJSON = BananaBase<string, string>
export type BananaFluid = BananaBase<string | ObjectId, string | Date>