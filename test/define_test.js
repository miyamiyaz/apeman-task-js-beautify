/**
 * Test case for define.
 * Runs with nodeunit.
 */

"use strict";

var define = require('../lib/define.js');

function noop() {
}

exports.setUp = function (done) {
    done();
};

exports.tearDown = function (done) {
    done();
};

exports['Define and run'] = function (test) {
    var task = define({});
    test.ok(task);
    var context = {
        verbose: false,
        logger: {
            info: noop,
            debug: noop,
            trace: noop
        }
    };
    task(context, function (err) {
        test.ifError(err);
        test.done();
    });
};

