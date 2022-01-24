import childProcess from 'child_process'

describe('lint-test', function () {
  it('lint', function () {
    jest.setTimeout(30000)
    return new Promise<void>((resolve, reject) =>
      childProcess.exec('npm run lint', (err, stdout, stderr) => {
        if (err) {
          err.message += '\n\n' + stdout.toString() + '\n\n' + stderr.toString()
          return reject(err)
        }
        const errStr = stderr.toString()
        if (errStr) {
          return reject(stdout.toString() + '\n\n' + errStr)
        }
        resolve()
      })
    )
  })
})
