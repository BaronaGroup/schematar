import childProcess from 'child_process'
import fs from 'fs'

const isOutputFile = /\.schematar\.ts$/
const outputDir = __dirname + '/../../test-output/tool-test'

describe('command-line-tool-test', function () {
  beforeEach(() => prepareOutputDirectory(outputDir))

  it('can be used to set up typescript interface files', async function () {
    await invokeTool(['test-schemas/simple-schema.ts', 'test-schemas/named-schema.ts'])
    expect(fs.readdirSync(outputDir).sort()).toEqual(['named-schema.schematar.ts', 'simple-schema.schematar.ts'])
    expect(await fs.promises.readFile(outputDir + '/named-schema.schematar.ts', 'utf8')).toMatchSnapshot()
    expect(await fs.promises.readFile(outputDir + '/simple-schema.schematar.ts', 'utf8')).toMatchSnapshot()
  })

  it('supports globs', async function () {
    await invokeTool(['test-schemas/exp-*-schema.ts'])
    expect(fs.readdirSync(outputDir).sort()).toMatchSnapshot()
  })

  it('supports multiple globs', async function () {
    await invokeTool(['test-schemas/exp-*-schema.ts', 'test-schemas/no-*-schema.ts'])
    expect(fs.readdirSync(outputDir).sort()).toMatchSnapshot()
  })

  async function prepareOutputDirectory(dir: string) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir)
    }
    for (const file of fs.readdirSync(dir)) {
      const ffn = `${dir}/${file}`
      if (isOutputFile.test(ffn)) {
        fs.unlinkSync(ffn)
      }
    }
  }

  async function invokeTool(schemaArgs: string[]) {
    childProcess.spawnSync(
      'npx',
      ['ts-node', __dirname + '/../app', 'create-typescript-interfaces', outputDir, ...schemaArgs],
      {
        stdio: 'inherit',
        env: process.env,
        cwd: __dirname,
      }
    )
  }
})
