/*!
 * Module dependencies.
 */

var fs = require('fs'),
    inject = require('connect-inject'),
    path = require('path')
    scripts = require('../util/scripts-to-inject');

/**
 * Middleware to inject JavaScript into the served app.
 *
 * Options:
 *
 *   - `options` {Object} contains all options available to other middleware.
 */

module.exports = function(options) {

    options.isBrowser = true;

    var scriptsToInject = scripts.getScripts(options)
    return inject({
        snippet: scriptsToInject
    });
};
