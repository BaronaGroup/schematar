import {Schema} from '../api'
import {testJSONSchema, testMongooseField, testTypescriptInterface} from './test-utils'

describe('schema-features-test', function () {
  describe('optional', function () {
    const schema: Schema = {
      fields: {
        field: {type: Number, optional: true}
      }
    }

    it('json-schema', testJSONSchema(schema, data => {
      expect(data).toMatchSnapshot()
    }))
/*  Not supported in mongoose; everything is optional
    it('mongoose', testMongooseField(schema, 'field', field => {
      expect(field).toEqual({type: Number})
    }))*/

    it('typescript', testTypescriptInterface(schema, tsInterface => {
      expect(tsInterface).toMatchSnapshot()
    }))
  })
  describe('optionalIn', function () {
    const schema: Schema = {
      fields: {
        field: {type: Number, optionalIn: ['o1', 'o2', 'o3']}
      }
    }

    describe('match', function() {
      it('json-schema', testJSONSchema(schema, data => {
        expect(data).toMatchSnapshot()
      }, {}, 'o2'))

      it('typescript', testTypescriptInterface(schema, tsInterface => {
        expect(tsInterface).toMatchSnapshot()
      }, {}, 'o2'))
    })

    describe('no match', function() {
      it('json-schema', testJSONSchema(schema, data => {
        expect(data).toMatchSnapshot()
      }))

      it('typescript', testTypescriptInterface(schema, tsInterface => {
        expect(tsInterface).toMatchSnapshot()
      }))
    })
  })

  describe('presentIn', function () {
    const schema: Schema = {
      fields: {
        field: {type: Number, presentIn: ['p1', 'p2', 'p3']}
      }
    }

    describe('match', function() {
      it('json-schema', testJSONSchema(schema, data => {
        expect(data).toMatchSnapshot()
      }, {}, 'p2'))

      it('typescript', testTypescriptInterface(schema, tsInterface => {
        expect(tsInterface).toMatchSnapshot()
      }, {}, 'p2'))

      it('mongoose', testMongooseField(schema, 'field', result => {
        expect(result).toEqual({type: Number})
      }, 'p2'))
    })

    describe('no match', function() {
      it('json-schema', testJSONSchema(schema, data => {
        expect(data).toMatchSnapshot()
      }))

      it('typescript', testTypescriptInterface(schema, tsInterface => {
        expect(tsInterface).toMatchSnapshot()
      }))

      it('mongoose', testMongooseField(schema, 'field', result => {
        expect(result).toBeUndefined()
      }))
    })
  })
})
