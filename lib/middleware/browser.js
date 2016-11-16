/*!
 * Module dependencies.
 */

var connect = require('connect'),
    fs = require('fs'),
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
    // any time a file is changed, we repopulate browser platform
    if (options.watch) {
        options.watch.on('all', function(event, filepath) {
            if (options.phonegap) {
                options.phonegap.util.cordova.prepare([], function(e, data) {
                    options.emitter.emit('browserPrepare');
                });
            }
        });
    }

    // prepare browser platform before serving
    if (options.phonegap && fs.existsSync(path.join(process.cwd(), 'platforms/browser'))) {
        options.phonegap.util.cordova.prepare([], function(e, data) {});
    }

    // serve the static browser platform assets
    return connect.static(path.join(process.cwd(), 'platforms/browser/www'));
};

/**
 * Add Cordova Browser Platform
 *
 * Helper function that is called before server starts up.
 *
 * Options:
 *
 *   - `options` {Object}
 *     - `options.phonegap` (Object) phonegap cli object
 */
 
module.exports.addBrowserPlatform = function(options) {
    if (options.phonegap && !fs.existsSync(path.join(process.cwd(), 'platforms/browser'))) {
        options.phonegap.cordova({ cmd: 'cordova platform add browser' }, function(e, data) {
            options.emitter.emit('browserAdded');
            options.phonegap.util.cordova.prepare([], function(e, data) {});
        });
    } else {
        process.nextTick(function() {
            options.emitter.emit('browserAdded');
        });
    }
};
