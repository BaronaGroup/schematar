import { testTypescriptInterface } from './test-utils'

describe('ts-features', function () {
  it(
    'allowNull',
    testTypescriptInterface({ fields: { field: { type: String, allowNull: true, optional: true } } }, (tsInterface) => {
      expect(tsInterface).toMatchSnapshot()
    })
  )

  const simpleSchema = { fields: { field: String } }
  it(
    'omitExtraExports (false)',
    testTypescriptInterface(
      simpleSchema,
      (tsInterface) => {
        expect(tsInterface).toMatchSnapshot()
      },
      { omitExtraExports: false }
    )
  )

  it(
    'omitExtraExports (true)',
    testTypescriptInterface(
      simpleSchema,
      (tsInterface) => {
        expect(tsInterface).toMatchSnapshot()
      },
      { omitExtraExports: true }
    )
  )

  it(
    'exportHash',
    testTypescriptInterface(
      simpleSchema,
      (tsInterface) => {
        expect(tsInterface).toMatchSnapshot()
      },
      { exportHash: 'hashField' }
    )
  )

  it(
    'doNotImportObjectId',
    testTypescriptInterface(
      simpleSchema,
      (tsInterface) => {
        // Note: meant to be used internally
        expect(tsInterface).toMatchSnapshot()
      },
      { doNotImportObjectId: true }
    )
  )

  describe('jsdoc', () => {
    it(
      'a simple comment',
      testTypescriptInterface(
        {
          fields: {
            myField: { type: String, jsdoc: 'This is just a comment.' },
          },
        },
        (tsInterface) => {
          // Note: meant to be used internally
          expect(tsInterface).toMatchSnapshot()
        }
      )
    )

    it(
      'a full jsdoc comment',
      testTypescriptInterface(
        {
          fields: {
            myField: {
              type: String,
              jsdoc: `
          /**
           * This is a perfectly fine way to do it as well
           * @deprecated
           */
          `,
            },
          },
        },
        (tsInterface) => {
          // Note: meant to be used internally
          expect(tsInterface).toMatchSnapshot()
        }
      )
    )
    it(
      'an array of jsdoc entries',
      testTypescriptInterface(
        {
          fields: {
            myField: { type: String, jsdoc: ['comment', '@deprecated', '@auth required'] },
          },
        },
        (tsInterface) => {
          // Note: meant to be used internally
          expect(tsInterface).toMatchSnapshot()
        }
      )
    )

    // Not really sensible, but permitted
    it(
      'an array of jsdoc entries with asterisks',
      testTypescriptInterface(
        {
          fields: {
            myField: { type: String, jsdoc: ['* comment', '* @deprecated'] },
          },
        },
        (tsInterface) => {
          // Note: meant to be used internally
          expect(tsInterface).toMatchSnapshot()
        }
      )
    )

    it(
      'a list of jsdoc entries',
      testTypescriptInterface(
        {
          fields: {
            myField: {
              type: String,
              jsdoc: `
              Description
              
              @deprecated
            `,
            },
          },
        },
        (tsInterface) => {
          // Note: meant to be used internally
          expect(tsInterface).toMatchSnapshot()
        }
      )
    )

    // Not really sensible, but permitted
    it(
      'a list of jsdoc entries with asterisks',
      testTypescriptInterface(
        {
          fields: {
            myField: {
              type: String,
              jsdoc: `
              * Description
              * 
              * @deprecated
            `,
            },
          },
        },
        (tsInterface) => {
          // Note: meant to be used internally
          expect(tsInterface).toMatchSnapshot()
        }
      )
    )
  })
})
