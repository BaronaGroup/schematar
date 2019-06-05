import {createTypescriptInterfaceFiles} from '../api'
import fs from 'fs'
import mkdirp = require('mkdirp')

const isOutputFile = /\.schematar\.ts$/

describe('api-test', function() {
  const outputDir = __dirname + '/../../test-output/api-test'
  beforeAll(async () => {
    await prepareOutputDirectory(outputDir)
    await createTypescriptInterfaceFiles(__dirname + '/test-schemas/*-schema.ts', outputDir)
  })

  describe('createTypescriptInterfaceFiles', function() {
    describe('implicit', function() {
      it('simple case', testOutputSnapshot('simple'))
      it('simple case with default export', testOutputSnapshot('default'))
      it('simple case with explicit name', testOutputSnapshot('named'))
    })

    describe('explicit', function() {
      it('no outputs', function() {
        expect(fs.existsSync(getOutputFilename('no-ts'))).toBe(false)
      })

      it('explicit name', testOutputSnapshot('exp-name'))

      it('explicit schema', testOutputSnapshot('exp-schema'))

      it('explicit context', testOutputSnapshot('exp-context'))

      it('omit extra exports', testOutputSnapshot('no-extra-exports'))

      it('export schema hash', testOutputSnapshot('export-hash'))

      it('multiple schemas', testOutputSnapshot('multiple-schemas'))

      it('supports using complex in place of the schema', testOutputSnapshot('complex-as-schema'))
    })
  })

  function getOutputFilename(baseName: string) {
    return `${outputDir}/${baseName}-schema.schematar.ts`
  }

  function testOutputSnapshot(baseName: string) {
    return async function() {

      const data = await fs.promises.readFile(getOutputFilename(baseName), 'utf8')
      expect(data).toMatchSnapshot()
    }
  }
})

async function prepareOutputDirectory(dir: string) {
  if (!fs.existsSync(dir)) {
    mkdirp.sync(dir)
  }
  for (const file of fs.readdirSync(dir)) {
    const ffn = `${dir}/${file}`
    if (isOutputFile.test(ffn)) {
      fs.unlinkSync(ffn)
    }
  }
}
