import fs from 'fs'
import path from 'path'

import { setMongoose as setMongooseImpl } from './mongoose-storage'
import { TypeGraphQLOptions } from './typeGraphQLOutput'

export interface ConfigFile {
  mongoose?: any
  pathsRelativeTo?: string
  transformations?: Array<{
    schemaFiles: string[]
    outputDirectory: string
    typescriptInterfaces?: boolean
    typeGraphQLClasses?: boolean | TypeGraphQLOptions
  }>
}

type ConfigFileWithPathsRelativeTo = Omit<ConfigFile, 'pathsRelativeTo'> & { pathsRelativeTo: string }
let config: null | ConfigFileWithPathsRelativeTo = null

export function setConfig(newConfig: ConfigFileWithPathsRelativeTo) {
  config = newConfig
  if (config.mongoose) {
    setMongooseImpl(config.mongoose)
  }
}

export function getConfig() {
  if (!config) throw new Error('Not configured')
  return config
}

export function loadConfig() {
  if (config) return
  let prevDir = '/'
  let dir = process.cwd()
  while (dir !== prevDir) {
    const fn = dir + '/.schematar.js'
    if (fs.existsSync(fn)) {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const config: ConfigFile = require(fn)
      setConfig({
        ...config,
        pathsRelativeTo: path.resolve(dir, config.pathsRelativeTo ?? '.'),
      })
      return
    }
    prevDir = dir
    dir = path.resolve(prevDir, '..')
  }
  throw new Error('Configuration file .schematar.js not found.')
}
