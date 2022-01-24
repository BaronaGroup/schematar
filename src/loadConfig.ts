import * as fs from 'fs'
import * as path from 'path'

let dir = process.cwd()

const filenames = ['schematar.js', '.schematar.js']

function loadConfig() {
  while (dir !== '/') {
    for (const possibleFilename of filenames) {
      const fullFilename = path.join(dir, possibleFilename)
      if (fs.existsSync(fullFilename)) {
        require(fullFilename)
        return
      }
    }
    dir = path.resolve(dir, '..')
  }
}

loadConfig()
