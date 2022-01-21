#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-env node */

try {
  require('schematar/dist/api').setMongoose(require('mongoose'))
} catch (err) {
  // ignoreed
}

require('schematar/dist/app')
