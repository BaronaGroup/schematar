import childProcess from 'child_process'

describe('lint-test', function() {
  it('tslint', function() {
    jest.setTimeout(30000)
    return new Promise((resolve, reject) =>
      childProcess.exec('npm run tslint', (err, stdout, stderr) => {
        if (err) {
          err.message += '\n\n' + stdout.toString() + '\n\n' + stderr.toString()
          return reject(err)
        }
        const errStr = stderr.toString()
        if (errStr) {
          return reject(stdout.toString() + '\n\n' + errStr)
        }
        resolve()
      }))
  })
})
