/**
 * Beautify code written in javascript.
 * @memberof module:apeman-task-js-beautify/lib
 * @function define
 * @param {object} [options] - Optional settings.
 * @returns {function} - Defined task function.
 */

"use strict";

var _ = require('underscore'),
    fs = require('fs'),
    argx = require('argx'),
    async = require('async'),
    objnest = require('objnest'),
    writeout = require('writeout'),
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

    /** options for js-beautify */
    var beautifyOpts = _.extend({
        "indent_size": 4,
        "indent_char": " ",
        "eol": "\n",
        "indent_level": 0,
        "indent_with_tabs": false,
        "preserve_newlines": true,
        "max_preserve_newlines": 10,
        "jslint_happy": true,
        "brace_style": "collapse",
        "keep_array_indentation": false,
        "keep_function_indentation": false,
        "space_before_conditional": true,
        "space_after_anon_function": true,
        "break_chained_methods": false,
        "eval_code": false,
        "unescape_strings": false,
        "wrap_line_length": 0,
        "wrap_attributes": "auto",
        "wrap_attributes_indent_size": 4,
        "end_with_newline": true
    }, options.options);

    /**
     * Defined task.
     * @function task
     * @param {object} context - Apeman task context.
     * @param {function} callback - Callback when done.
     */
    function task(context, callback) {
        var logger = context.logger,
            verbose = context.verbose;

        asunc.waterfall([
            function (callback) {
                expandglob(basedir, callback);
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
    task.$desc = "Beautify source file written in javascript.";
    return task;
}

module.exports = define;
