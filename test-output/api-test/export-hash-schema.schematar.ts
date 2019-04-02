// Generated file, do not edit!

// tslint:disable array-type
// @ts-ignore -- ignore possibly unused type parameters
export interface ExportHashSchemaBase<IDType, DateType> {
  field: string
}
import {ObjectId} from 'mongodb'
export type ExportHashSchemaMongoose = ExportHashSchemaBase<ObjectId, Date>
export type ExportHashSchemaJSON = ExportHashSchemaBase<string, string>
export type ExportHashSchemaFluid = ExportHashSchemaBase<string | ObjectId, string | Date>
export const mySchemaHash = '5d3861b32891d91c94cafb81aa1f821ae442e516d406e1e3bea47f6cb312b11f'