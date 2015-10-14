/** This example Apemanfile to use apeman-task-js-beautify */

"use strict";

module.exports = {
    $pkg: {/*...*/},
    $tasks: {
        // Define your own task.
        'my-task-01': require('apeman-task-js-beautify')('some/pattern/**/*.js', {
            //Options
            beautifyOptions: {
                'indent_size': 4
            }
        })
    }
};
