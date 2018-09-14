/*!
 * Module dependencies.
 */

var connect = require('connect'),
    path = require('path'),
    serveStatic = require('serve-static');

/**
 * Static asset middleware.
 *
 * Serves the PhoneGap app from the current working directory.
 */

module.exports = function() {
    return serveStatic(path.join(process.cwd(), 'www'));
};
