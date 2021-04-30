import { Complex, createMongooseSchema } from '../api'

describe('mongoose-features', function () {
  it('default value', function () {
    const ms = createMongooseSchema({
      fields: {
        field: { type: String, mongooseDefault: 'Bob' },
      },
    })
    expect(ms.field.default).toBe('Bob')
  })

  describe('indexing', function () {
    it('none', function () {
      const ms = createMongooseSchema({
        fields: {
          field: { type: String },
        },
      })
      expect(ms.field.index).toBeFalsy()
      expect(ms.field.unique).toBeFalsy()
      expect(ms.field.sparse).toBeFalsy()
    })

    it('index', function () {
      const ms = createMongooseSchema({
        fields: {
          field: { type: String, index: true },
        },
      })
      expect(ms.field.index).toBe(true)
      expect(ms.field.unique).toBeFalsy()
      expect(ms.field.sparse).toBeFalsy()
    })

    it('unique', function () {
      const ms = createMongooseSchema({
        fields: {
          field: { type: String, index: 'unique' },
        },
      })
      expect(ms.field.index).toBeFalsy()
      expect(ms.field.unique).toBe(true)
      expect(ms.field.sparse).toBeFalsy()
    })

    it('unique-sparse', function () {
      const ms = createMongooseSchema({
        fields: {
          field: { type: String, index: 'unique-sparse' },
        },
      })
      expect(ms.field.index).toBeFalsy()
      expect(ms.field.unique).toBe(true)
      expect(ms.field.sparse).toBe(true)
    })
  })

  it('ref', function () {
    const ms = createMongooseSchema({
      fields: {
        field: { type: String, mongooseRef: 'otherSchema' },
      },
    })
    expect(ms.field.ref).toBe('otherSchema')
  })

  it('expires', function () {
    const ms = createMongooseSchema({
      fields: {
        field: { type: String, mongooseExpires: '60m' },
      },
    })
    expect(ms.field.expires).toBe('60m')
  })

  it('"mongoose"', function () {
    const ms = createMongooseSchema({
      fields: {
        field: { type: String, mongoose: { submarine: 'underwater' } },
      },
    })
    expect((ms.field as any).submarine).toBe('underwater')
  })
  describe('transformer', function () {
    it('can transform a field', function () {
      const ms = createMongooseSchema(
        {
          fields: {
            field: { type: String },
          },
        },
        {
          transformer(input) {
            return {
              ...input,
              unique: true,
            }
          },
        }
      )
      expect(ms.field.unique).toBe(true)
    })

    it('can transform multiple fields', function () {
      const ms: any = createMongooseSchema(
        {
          fields: {
            a: { type: String },
            b: String,
          },
        },
        {
          transformer(input, path) {
            return {
              ...input,
              testPath: path,
            }
          },
        }
      )
      expect(ms.a.testPath).toEqual(['a'])
      expect(ms.b.testPath).toEqual(['b'])
    })

    it('can transform from within a complex', function () {
      const ms: any = createMongooseSchema(
        {
          fields: {
            field: new Complex({
              inner: Number,
            }),
          },
        },
        {
          transformer(input, path) {
            return (
              input.type && {
                ...input,
                ctor: input.type.name,
              }
            )
          },
        }
      )
      expect(ms.field.inner.ctor).toEqual('Number')
    })

    it('can transform from within an array', function () {
      const ms: any = createMongooseSchema(
        {
          fields: {
            simpleArray: [Number],
            complexArray: [
              new Complex({
                inner: Number,
              }),
            ],
          },
        },
        {
          transformer(input, path) {
            return (
              input.type && {
                ...input,
                flag: true,
              }
            )
          },
        }
      )
      expect(ms.simpleArray.flag).toBeTruthy()
      expect(ms.complexArray.flag).toBeTruthy()
      expect(ms.complexArray.type[0].inner.flag).toBeTruthy()
    })
  })
})
