#!/usr/bin/env node

const importLocal = require('import-local')
const npmlog = require('npmlog')

if (importLocal(__filename)) {
  npmlog.info('node_modulesm内本地文件')
} else {
  require('../lib')()
}
