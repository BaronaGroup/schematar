import {FieldInfo, Schema} from '../../schema'
import {testJSONSchema, testMongooseField, testTypescriptInterface} from '../test-utils'
import Complex from '../../complex'
import {JSONSchemaOptions, JSONSchemaProperty} from '../../json-schema-output'

describe('complex-test', function () {
  describe('basic type', function () {
    const schema: Schema = {
      fields: {
        field: new Complex({
          innerField: Number
        })
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

  describe('can be inherited to override output behavior', function () {
    class MyComplex extends Complex {
      constructor() {
        super({})
      }

      public outputJSONSchema(): JSONSchemaProperty {
        return {type: 'custom-json'}
      }

      public outputMongoose() {
        return {plain: 'custom-mongoose'}
      }

      public outputTypescript() {
        return 'TSCustom'
      }
    }

    const schema: Schema = {
      fields: {
        field: new MyComplex()
      }
    }

    it('json-schema', testJSONSchema(schema, data => {
      expect(data).toMatchSnapshot()
    }))

    it('mongoose', testMongooseField(schema, 'field', field => {
      expect(field).toEqual('custom-mongoose')
    }))

    it('typescript', testTypescriptInterface(schema, tsInterface => {
      expect(tsInterface).toMatchSnapshot()
    }))

    describe('inherited complex methods have access to various data', function () {
      const myContext = 'banana'

      let asserts: string[] = []

      beforeEach(() => asserts = [])

      class DataComplex extends Complex {
        constructor() {
          super({})
        }

        public outputJSONSchema(context: string, options: JSONSchemaOptions, field: FieldInfo) {
          expect(context).toBe(myContext)
          expect(options.makeEverythingOptional).toBe(true)
          expect(field).toBe(dataSchema.fields.myField)
          asserts.push('json')
          return super.outputJSONSchema(context, options, field)
        }

        public outputMongoose(context: string, field: FieldInfo): { type: any } | { plain: any } {
          expect(context).toBe(myContext)
          expect(field).toBe(dataSchema.fields.myField)
          asserts.push('mongoose')
          return super.outputMongoose(context, field)
        }

        public outputTypescript(context: string, indentation: string, field: FieldInfo): string {
          expect(context).toBe(myContext)
          expect(indentation).toBe('  ')
          expect(field).toBe(dataSchema.fields.myField)
          asserts.push('typescript')
          return super.outputTypescript(context, indentation, field)
        }
      }

      const dataSchema: Schema = {
        fields: {
          myField: {
            type: new DataComplex(),
            index: 'unique'
          }
        }
      }

      it('json-schema', testJSONSchema(dataSchema, () => {
        expect(asserts).toEqual(['json'])
      }, {makeEverythingOptional: true}, myContext))

      it('mongoose', testMongooseField(dataSchema, 'myField', () => {
        expect(asserts).toEqual(['mongoose'])
      }, myContext))

      it('typescript', testTypescriptInterface(dataSchema, () => {
        expect(asserts).toEqual(['typescript'])
      }, {}, myContext))
    })
  })

  describe('json-schema additional properties', function() {
    const schema: Schema = {
      fields: {
        field: new Complex({
          innerField: Number
        })
      }
    }
    it('forbidden by default', testJSONSchema(schema, data => {
      expect(data).toMatchSnapshot()
    }))

    it('can be permitted', testJSONSchema(schema, data => {
      expect(data).toMatchSnapshot()
    }, {allowAdditionalFieldsNested: true}))
  })
})
