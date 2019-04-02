import {createMongooseSchema} from '../api'

describe('mongoose-features', function () {

  it('default value', function () {
    const ms = createMongooseSchema({
      fields: {
        field: {type: String, mongooseDefault: 'Bob'}
      }
    })
    expect(ms.field.default).toBe('Bob')
  })

  describe('indexing', function() {
    it('none', function () {
      const ms = createMongooseSchema({
        fields: {
          field: {type: String}
        }
      })
      expect(ms.field.index).toBeFalsy()
      expect(ms.field.unique).toBeFalsy()
      expect(ms.field.sparse).toBeFalsy()
    })

    it('index', function () {
      const ms = createMongooseSchema({
        fields: {
          field: {type: String, index: true}
        }
      })
      expect(ms.field.index).toBe(true)
      expect(ms.field.unique).toBeFalsy()
      expect(ms.field.sparse).toBeFalsy()
    })

    it('unique', function () {
      const ms = createMongooseSchema({
        fields: {
          field: {type: String, index: 'unique'}
        }
      })
      expect(ms.field.index).toBeFalsy()
      expect(ms.field.unique).toBe(true)
      expect(ms.field.sparse).toBeFalsy()
    })

    it('unique-sparse', function () {
      const ms = createMongooseSchema({
        fields: {
          field: {type: String, index: 'unique-sparse'}
        }
      })
      expect(ms.field.index).toBeFalsy()
      expect(ms.field.unique).toBe(true)
      expect(ms.field.sparse).toBe(true)
    })
  })

  it('ref', function () {
    const ms = createMongooseSchema({
      fields: {
        field: {type: String, mongooseRef: 'otherSchema'}
      }
    })
    expect(ms.field.ref).toBe('otherSchema')
  })

  it('expires', function () {
    const ms = createMongooseSchema({
      fields: {
        field: {type: String, mongooseExpires: '60m'}
      }
    })
    expect(ms.field.expires).toBe('60m')
  })
})
