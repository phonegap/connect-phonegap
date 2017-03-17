/*!
 * Module dependencies.
 */

var connect = require('connect'),
    path = require('path');

/**
 * Desktop Browser Middlware.
 *
 * Serves up cordova browser on all HTTP requests.
 *
 * Options:
 *
 *   - `options` {Object}
 *     - `options.phonegap` (Object) phonegap cli object
 *     - `options.watch` (Object) gaze object
 */


module.exports = function(options) {
    // serve the static browser platform assets
    return connect.static(path.join(process.cwd(), 'platforms/browser/www'));
};


 


