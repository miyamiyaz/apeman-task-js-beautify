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
    beautify = require('js-beautify').js_beautify,
    expandglob = require('expandglob');

/** @lends define */
function define(pattern, options) {
    var args = argx(arguments);
    options = objnest.expand(args.pop('object') || {});

    /** file encoding */
    var encoding = options.encoding || 'utf8';

    /** options of js-beautify */
    var beautifyOpts = options.beautifyOptions || {};

    /** ignore cases */
    var ignore = options.ignore || [];

    /** ignore error */
    var ignoreError = options.ignoreError || false;

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
                expandglob(pattern, {ignore: ignore}, callback);
            },
            function (filenames, callback) {
                async.eachSeries(filenames, function (filename, callback) {
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
                            }, function (err, result) {
                                if (err) {
                                    callback(ignoreError ? null : err);
                                    return;
                                }
                                if (!result.skipped) {
                                    logger.debug('JS beautified:', result.filename);
                                }
                                callback();
                            });
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
