'use strict';
// 注意安装5.0.0版本 6.0.1 是ES模块
const pkgDir = require('pkg-dir').sync
const path = require('path')
const fse = require('fs-extra')
const npminstall = require('npminstall')
const pathExists = require('path-exists').sync
const { isObject } = require('@zml-lerna-test/utils')
const { getDefaultRegistry, getNpmLatestVersion } = require('@zml-lerna-test/get-npm-info')
const formatPath = require('@zml-lerna-test/format-path')

class Package {
  constructor(options) {
    if (!options) {
      throw new Error('Package类的options参数不能为空!')
    }

    if (!isObject(options)) {
      throw new Error('Package类的options参数必须为对象!')
    }

    console.log('this is package')
    // package路径
    this.targetPath = options.targetPath
    // package路径
    this.storeDir = options.storeDir
    // package的name
    this.packageName = options.name
    // package的版本
    this.packageVersion = options.version
    // 
    this.cacheFilePathPrefix = this.packageName.replace('/', '_')
  }

  checktOptions(option) { }

  async prepare() {
    // 缓存目录生成
    if (this.storeDir && !pathExists(this.storeDir)) {
      fse.mkdirpSync(this.storeDir)
    }
    if (this.packageVersion === 'latest') {
      this.packageVersion = await getNpmLatestVersion(this.packageName)
    }
  }

  // 判断当前Package是否存在
  async exists() {
    console.log('exists')
    if (this.storeDir) {
      await this.prepare()
      return pathExists(this.cacheFilePath)
    } else {
      return pathExists(this.targetPath)
    }
  }

  // 返回当前命令需要安装的版本缓存路径
  get cacheFilePath() {
    return path.resolve(this.storeDir, `_${this.cacheFilePathPrefix}@${this.packageVersion}@${this.packageName}`)
  }

  // 返回任意版本的缓存路径
  getSpecificCacheFilePath(packageVersion) {
    return path.resolve(this.storeDir, `_${this.cacheFilePathPrefix}@${packageVersion}@${this.packageName}`)
  }

  // 安装Package
  async install() {
    console.log('install')
    await this.prepare()
    await npminstall({
      root: this.targetPath,
      storeDir: this.storeDir,
      registry: getDefaultRegistry(),
      pkgs: [
        {
          name: this.packageName, version: this.packageVersion
        }
      ]
    }).catch((e) => {
      console.log(e)
    })
  }

  // 升级Package
  async upDate() {
    console.log('upDate')
    // 1. 获取最新版本好
    const latestVersion = await getNpmLatestVersion(this.packageName)
    // 2. 查找最新版本好是否存在
    const latestFilePath = this.getSpecificCacheFilePath(latestVersion)
    if (!pathExists(latestFilePath)) {
      await npminstall({
        root: this.targetPath,
        storeDir: this.storeDir,
        registry: getDefaultRegistry(),
        pkgs: [
          {
            name: this.packageName, version: latestVersion
          }
        ]
      }).catch((e) => {
        console.log(e)
      })
      this.packageVersion = latestVersion
    }
    // 3. 
  }


  _getRootFilePath(targetPath) {
    // 1. 获取package.json所在目录
    // 3. 寻找main 或 lib
    // 4. 路径的兼容[macOS/windows]
    const dir = pkgDir(targetPath)
    if (dir) {
      // 2. 读取package.json
      const pkgFile = require(path.resolve(dir, 'package.json'))
      if (pkgFile && (pkgFile.main)) {
        return formatPath(path.resolve(dir, pkgFile.main))
      }
    }
    return null
  }

  // 获取入口文件
  getRootFilePath() {
    // 使用缓存
    if (this.storeDir) {
      return this._getRootFilePath(this.cacheFilePath)
    } else {
      return this._getRootFilePath(this.targetPath)
    }
  }
}

module.exports = Package;

