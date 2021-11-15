"use strict";

const cp = require("child_process")
const path = require("path");
const Package = require("@zml-lerna-test/package");
const log = require("@zml-lerna-test/log");

// 命令对应的包的 map
const SETTINGS = {
  init: "@zml-lerna-test/init",
  init1: "@zml-lerna-test/init1",
};

const CATCH_DIR = "dependencies";

async function exec() {
  const homePath = process.env.CLI_HOME_PATH;
  // 用于调试的路径
  let targetPath = process.env.CLI_TARGET_PATH;

  let storeDir = "";
  let pkg;
  // arguments
  // 第一位是 projectName  第二项是关于子command的option  第三项是子command实例
  // 视频上是从command实例上拿option
  const cmdObj = arguments[arguments.length - 1];
  const cmdName = cmdObj.name();
  log.verbose(cmdName);
  const packageName = SETTINGS[cmdName];
  // const packageVersion = "0.1.4";
  const packageVersion = "latest";
  // const packageVersion = '*'

  if (!targetPath) {
    targetPath = path.resolve(homePath, CATCH_DIR);
    storeDir = path.resolve(homePath, "node_modules");
    log.verbose("targetPath", targetPath);
    log.verbose("storeDir", storeDir);
    pkg = new Package({
      targetPath,
      storeDir,
      name: packageName,
      version: packageVersion,
    });
    if (await pkg.exists()) {
      // 更新包
      await pkg.upDate();
    } else {
      // 安装包
      await pkg.install();
    }
  } else {
    pkg = new Package({
      targetPath,
      name: packageName,
      version: packageVersion,
    });
  }
  const rootFile = pkg.getRootFilePath();

  if (rootFile) {
    try {
      const args = Array.from(arguments);
      const cmd = args[args.length - 1];
      const o = Object.create(null);
      Object.keys(cmd).forEach((key) => {
        if (cmd.hasOwnProperty(key) && !key.startsWith("_") && key !== "parent") {
          o[key] = cmd[key];
        }
      });
      args[args.length - 1] = o;
      const code = `require('${rootFile}').call(null,${JSON.stringify(args)} )`;
      const child = cp.spawn("node", ["-e", code], {
        cwd: process.cwd(),
        stdio: "inherit",
      });

      child.on("error", (e) => {
        log.error(e.message);
        process.exit(1);
      });
      child.on("exit", (e) => {
        log.verbose("exit");
        process.exit(0);
      });
    } catch (e) {
      log.error(e.message); 
    }
  }
}

module.exports = exec;