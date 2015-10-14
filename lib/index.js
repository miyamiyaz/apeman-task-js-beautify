/**
 * Beautify code written in javascript.
 * @module apeman-task-js-beautify
 * @version 1.0.1
 */

"use strict";

var define = require('./define'),
    pkg = require('../package.json');

var lib = define.bind(this);
lib.define = define;
lib.version = pkg.version;

module.exports = lib;
