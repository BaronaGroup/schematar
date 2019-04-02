import {Schema} from '../../schema'
import {testJSONSchema, testMongooseField, testTypescriptInterface} from '../test-utils'

describe('boolean-test', function() {
  describe('basic type', function() {
    const schema: Schema = {fields: {
      field: Boolean
    }}

    it('json-schema', testJSONSchema(schema, data => {
      expect(data).toMatchSnapshot()
    }))

    it('mongoose', testMongooseField(schema, 'field', field => {
      expect(field).toEqual({type: Boolean})
    }))

    it('typescript', testTypescriptInterface(schema, tsInterface => {
      expect(tsInterface).toMatchSnapshot()
    }))
  })
})
