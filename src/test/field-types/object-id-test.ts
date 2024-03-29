import mongoose from 'mongoose'

import { ObjectId } from '../../object-id'
import { Schema } from '../../schema'
import { testJSONSchema, testMongooseField, testTypescriptInterface } from '../test-utils'

describe('object-id-test', function () {
  describe('basic type', function () {
    const schema: Schema = {
      fields: {
        field: ObjectId,
      },
    }

    it(
      'json-schema',
      testJSONSchema(schema, (data) => {
        expect(data).toMatchSnapshot()
      })
    )

    it(
      'mongoose',
      testMongooseField(schema, 'field', (field) => {
        expect(field).toEqual({ type: mongoose.Schema.Types.ObjectId })
      })
    )

    it(
      'typescript',
      testTypescriptInterface(schema, (tsInterface) => {
        expect(tsInterface).toMatchSnapshot()
      })
    )
  })
})
