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
    checkInputArfs()
    checkGlobalUpdate()
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

let args

function checkInputArfs() {
  const minimist = require('minimist')
  args = minimist(process.argv.slice(2))
  checkArgs()
}

function checkArgs() {
  if (args.debug) {
    process.env.LOG_LEVEL = 'verbose'
  } else {
    process.env.LOG_LEVEL = 'info'
  }
  log.level = process.env.LOG_LEVEL
}

async function checkGlobalUpdate() {
  // 获取当前版本号和模块名
  const { version: currentVersion, name: npmName } = pkg
  // 调用NPM API
  const { getNpmSemverVersion } = require('@zml-lerna-test/get-npm-info')
  const lastVersion = await getNpmSemverVersion(currentVersion, npmName)
  if (lastVersion && semver.gt(lastVersion, currentVersion)) {
    log.warn(colors.yellow('请升级版本，当前版本：', currentVersion, '最新版本：', lastVersion))
  }
}

const commander = require('commander')

const program = new commander.Command()

console.log(pkg.bin)
// 初始化
program
  .name(Object.keys(pkg.bin)[0])
  .usage('<command> [options]')
  .version(pkg.version)
  .option('-d, --debug', '是否开启调试模式', false)
  .option('-f, --force', '是否强制添加', true)
  .option('-e, --envName <envName>', '获取环境变量名称')

// 注册命令
const add = program.command('add <name> [name2] [name3]')
add
  .description('添加')
  .option('-f, --force', '是否强制添加')
  .action((name, name2, name3, cmdObj) => {
    console.log('do add', name, name2, cmdObj.force)
  })


// addCommand 注册命令
const server = new commander.Command('server')
server
  .command('start [port]')
  .description('开启服务')
  .action((port) => {
    console.log('server listening  on port:', port)
  })

server
  .command('stop')
  .description('停止服务')
  .action(() => {
    console.log('server stop')
  })

program.addCommand(server)


program
  .parse(process.argv)

module.exports = core;
