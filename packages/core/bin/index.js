#!/usr/bin/env node
const core = require('../lib/index')

const bin = () => {
  console.log('bin')
  core()
}

bin()