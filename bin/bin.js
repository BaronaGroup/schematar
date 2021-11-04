#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-env node */
const fs = require('fs')
if (fs.existsSync(__dirname + '/../package.json')) {
  require('../dist/app')
} else {
  require('schematar/dist/app')
}
