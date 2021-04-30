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
})
