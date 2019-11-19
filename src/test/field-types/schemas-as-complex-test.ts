import {FieldInfo, Schema} from '../../schema'
import {testJSONSchema, testMongooseField, testTypescriptInterface} from '../test-utils'
import Complex from '../../complex'
import {JSONSchemaProperty} from '../../json-schema-output'

describe('schema-as-complex-test', function () {
  describe('basic type', function () {

    const inner: Schema = {
      fields: {
        innerField: Number
      }
    }
    const schema: Schema = {
      fields: {
        field: inner
      }
    }

    it('json-schema', testJSONSchema(schema, data => {
      expect(data).toMatchSnapshot()
    }))

    it('mongoose', testMongooseField(schema, 'field', field => {
      expect(field).toEqual({innerField: {type: Number}})
    }))

    it('typescript', testTypescriptInterface(schema, tsInterface => {
      expect(tsInterface).toMatchSnapshot()
    }))
  })
})
