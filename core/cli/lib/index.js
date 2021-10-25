'use strict';


const semver = require('semver')
const colors = require('colors')
const rootCheck = require('root-check')
const userHome = require('user-home')
const pathExists = require('path-exists').sync

const pkg = require('../package.json')
const constant = require('./contant')
// const utils = require('@zml-lerna-test/utils')
const log = require('@zml-lerna-test/log')


function core() {
  try {
    rootCheck()
    checkPkgVersion()
    checkNodeVersion()
    checkRoot()
    checkUserHome()
  } catch (e) {
    log.error(e.message)
  }
}

function checkPkgVersion() {
  log.info(pkg.version)
}

function checkNodeVersion() {
  const currentVersion = process.version
  const lowestVersion = constant.LOWEST_NODE_VERSION
  if (!semver.gte(currentVersion, lowestVersion)) {
    throw new Error(colors.red(`请安装${lowestVersion}版本及以上node`))
  }
}

function checkRoot() {
  console.log(`uid:${process.geteuid()}`)
}

function checkUserHome() {
  if (!userHome || !pathExists(userHome)) {
    throw new Error(colors.red('当前登录用户主目录不存在！'))
  }
}

module.exports = core;
