import Complex from '../complex'
import { Schema } from '../schema'
import { testJSONSchema } from './test-utils'

describe('json-schema-features', function () {
  const simpleSchema: Schema = {
    fields: {
      field: String,
      field2: Number,
    },
  }
  it(
    'allowNull',
    testJSONSchema({ fields: { field: { type: String, allowNull: true, optional: true } } }, (schema) => {
      expect(schema).toMatchSnapshot()
    })
  )

  it(
    'schemaId',
    testJSONSchema(
      { fields: { field: { type: String, allowNull: true, optional: true } } },
      (schema) => {
        expect(schema).toMatchSnapshot()
      },
      { schemaId: 'myschema' }
    )
  )

  it(
    'custom fields',
    testJSONSchema({ fields: { field: { type: String, jsonSchema: { year: 2020 } } } }, (schema) => {
      expect(schema).toMatchSnapshot()
    })
  )

  describe('makeEverythingOptional', function () {
    it(
      'shallow',
      testJSONSchema(
        simpleSchema,
        (schema) => {
          expect(schema).toMatchSnapshot()
        },
        { makeEverythingOptional: true }
      )
    )

    it(
      'deep',
      testJSONSchema(
        {
          fields: {
            topLevel: String,
            deep1: [
              new Complex({
                key: Number,
              }),
            ],
            deep2: new Complex({
              key2: Number,
              deep2: new Complex({
                key3: Number,
              }),
            }),
          },
        },
        (schema) => {
          expect(schema).toMatchSnapshot()
        },
        { makeEverythingOptional: true }
      )
    )
  })

  describe('allowAdditionalFields', function () {
    it(
      'shallow',
      testJSONSchema(
        simpleSchema,
        (schema) => {
          expect(schema).toMatchSnapshot()
        },
        { allowAdditionalFields: true }
      )
    )

    // Note: is not deep
    it(
      'deep',
      testJSONSchema(
        {
          fields: {
            topLevel: String,
            deep1: [
              new Complex({
                key: Number,
              }),
            ],
            deep2: new Complex({
              key2: Number,
              deep2: new Complex({
                key3: Number,
              }),
            }),
          },
        },
        (schema) => {
          expect(schema).toMatchSnapshot()
        },
        { allowAdditionalFields: true }
      )
    )
  })
})
