import {Schema} from '../../schema'
import {testJSONSchema, testMongooseField, testTypescriptInterface} from '../test-utils'
import Complex from '../../complex'

describe('array-test', function() {
  describe('array of simple values', function() {
    const schema: Schema = {fields: {
      field: [Number]
    }}

    it('json-schema', testJSONSchema(schema, data => {
      expect(data).toMatchSnapshot()
    }))

    it('mongoose', testMongooseField(schema, 'field', field => {
      expect(field).toEqual({type: [{type: Number}]})
    }))

    it('typescript', testTypescriptInterface(schema, tsInterface => {
      expect(tsInterface).toMatchSnapshot()
    }))
  })

  describe('array of simple values defined with options', function() {
    const schema: Schema = {fields: {
      field: [{type: Number, index: true}]
    }}

    it('json-schema', testJSONSchema(schema, data => {
      expect(data).toMatchSnapshot()
    }))

    it('mongoose', testMongooseField(schema, 'field', field => {
      expect(field).toEqual({type: [{type: Number, index: true}]})
    }))

    it('typescript', testTypescriptInterface(schema, tsInterface => {
      expect(tsInterface).toMatchSnapshot()
    }))
  })

  describe('array of complex values', function() {
    const schema: Schema = {fields: {
      field: [new Complex({
        innerField: Number
      })]
    }}

    it('json-schema', testJSONSchema(schema, data => {
      expect(data).toMatchSnapshot()
    }))

    it('mongoose', testMongooseField(schema, 'field', field => {
      expect(field).toEqual({type: [{innerField: {type: Number}}]})
    }))

    it('typescript', testTypescriptInterface(schema, tsInterface => {
      expect(tsInterface).toMatchSnapshot()
    }))
  })
})
