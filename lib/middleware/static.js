/*!
 * Module dependencies.
 */

var connect = require('connect'),
    path = require('path');

/**
 * Static asset middleware.
 *
 * Serves the PhoneGap app from the current working directory.
 */

module.exports = function(options) {
    return connect.static(path.resolve(options.www || 'www'));
};
