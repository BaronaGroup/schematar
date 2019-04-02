import {Schema} from '../../schema'
import {testJSONSchema, testMongooseField, testTypescriptInterface} from '../test-utils'
import Complex from '../../complex'

describe('complex-test', function() {
  describe('basic type', function() {
    const schema: Schema = {fields: {
      field: new Complex({
        innerField: Number
      })
    }}

    it('json-schema', testJSONSchema(schema, data => {
      expect(data).toMatchSnapshot()
    }))

    it('mongoose', testMongooseField(schema, 'field', field => {
      expect(field).toEqual({type: {innerField: {type: Number}}})
    }))

    it('typescript', testTypescriptInterface(schema, tsInterface => {
      expect(tsInterface).toMatchSnapshot()
    }))
  })
})
