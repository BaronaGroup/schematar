import { createMongooseSchema } from '../../api'
import now from '../../now'
import { Schema } from '../../schema'
import { testJSONSchema, testMongooseField, testTypescriptInterface } from '../test-utils'

describe('date-test', function () {
  describe('basic type', function () {
    const schema: Schema = {
      fields: {
        field: Date,
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
        expect(field).toEqual({ type: Date })
      })
    )

    it(
      'typescript',
      testTypescriptInterface(schema, (tsInterface) => {
        expect(tsInterface).toMatchSnapshot()
      })
    )
  })

  it('defaulting to "now" in mongoose', function () {
    const schema = {
      fields: {
        field: { type: Date, mongooseDefault: now },
      },
    }
    const ms = createMongooseSchema(schema)
    expect(ms.field.default).toBe(Date.now)
  })
})
