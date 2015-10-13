/**
 * Beautify code written in javascript.
 * @memberof module:apeman-task-js-beautify/lib
 * @function define
 * @param {object} [options] - Optional settings.
 * @returns {function} - Defined task function.
 */

'use strict';

var _ = require('underscore'),
    fs = require('fs'),
    argx = require('argx'),
    async = require('async'),
    objnest = require('objnest'),
    writeout = require('writeout'),
    statmode = require('stat-mode'),
    beautify = require('js-beautify').js_beautify,
    expandglob = require('expandglob');

/** @lends define */
function define(options) {
    var args = argx(arguments);
    options = objnest.expand(args.pop('object') || {});

    /** base directory */
    var basedir = [].concat(options.basedir || process.cwd());

    /** file encoding */
    var encoding = options.encoding || 'utf8';

    /** options of js-beautify */
    var beautifyOpts = options.options || {};

    /**
     * Defined task.
     * @function task
     * @param {object} context - Apeman task context.
     * @param {function} callback - Callback when done.
     */
    function task(context, callback) {
        var logger = context.logger,
            verbose = context.verbose;

        async.waterfall([
            function (callback) {
                expandglob(basedir, callback);
            },
            function (filenames, callback) {
                async.eachSeries(filenames, function (filename, callback) {
                    var mode = new statmode(fs.statSync(filename));
                    if (!(mode.owner.read && mode.owner.write)) {
                        callback();
                    }

                    async.waterfall([
                        function (callback) {
                            fs.readFile(filename, encoding, callback);
                        },
                        function (content, callback) {
                            callback(null, beautify(content, beautifyOpts));
                        },
                        function (content, callback) {
                            writeout(filename, content, {
                                skipIfIdentical: true
                            }, callback);
                        },
                        function (writeResult, callback) {
                            if (!writeResult.skipped) {
                                logger.debug('JS beautified:', writeResult.filename);
                            }
                            callback();
                        }
                    ], callback);
                }, callback);
            }
        ], callback);
    }

    // Description of this task.
    task.$desc = 'Beautify source file written in javascript.';
    return task;
}

module.exports = define;
