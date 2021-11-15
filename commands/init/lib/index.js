// commands/init
"use strict";

const Command = require("@zml-lerna-test/command");

class InitCommand extends Command { }

function init(args) {
  return new InitCommand(args);
}

module.exports = init;