import { createJSONSchema, createMongooseSchema, createTypescriptInterfaceDefinition } from '../api'
import { JSONSchemaOptions, JSONSchemaProperty } from '../json-schema-output'
import { Schema } from '../schema'
import { TSOptions } from '../ts-output'

type JsonSchemaAssertFn = (value: string) => void | Promise<void>
type MongooseAssertFn = (value: any) => void | Promise<void>
type TsAssertFn = (output: string) => void | Promise<void>

export function testJSONSchema(
  schema: Schema,
  assertFn: JsonSchemaAssertFn,
  options: JSONSchemaOptions = {},
  context = 'json-schema'
) {
  return function () {
    return assertFn(JSON.stringify(createJSONSchema(schema, context, options), null, 2))
  }
}

export function testMongooseField(schema: Schema, field: string, assertFn: MongooseAssertFn, context = 'mongoose') {
  return function () {
    assertFn(createMongooseSchema(schema, context)[field])
  }
}

export function testTypescriptInterface(
  schema: Schema,
  assertFn: TsAssertFn,
  options: TSOptions = { omitExtraExports: true },
  context = 'typescript'
) {
  return function () {
    return assertFn(createTypescriptInterfaceDefinition('TestInterface', schema, context, options))
  }
}
