/*!
 * Module dependencies.
 */

var connect = require('connect'),
    fs = require('fs'),
    path = require('path'),
    shell = require('shelljs');

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
        if (options.isDesktop) {
            addDesktopBrowser(options);
            return;
        }

        options.phonegap.util.cordova.platform('add', 'browser', function(e, data) {
            options.phonegap.util.cordova.prepare([], function(e, data) {});
        });
    }
};

function addDesktopBrowser(options) {
    // copy in platforms/browser folder
    var browserPlatform = path.join(__dirname, 'platforms', 'browser');
    if (fs.existsSync(browserPlatform)) {
        shell.cp('-R', browserPlatform, path.join(process.cwd(), 'platforms'));
    }

    // update platforms.json
    var data = {};
    var platformJson = path.join(process.cwd(), 'platforms', 'platforms.json');
    if (fs.existsSync(platformJson)) {
        data = JSON.parse(fs.readFileSync(platformJson, 'utf-8'));
    }
    data.browser = '4.0.0';
    fs.writeFileSync(platformJson, JSON.stringify(data, null, 4), 'utf-8');

    options.phonegap.util.cordova.prepare([], function(e, data) {
        if (e) console.log('*** e: ', e);
        if (data) console.log('*** data: ', data);
    });
}
