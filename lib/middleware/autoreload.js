/*!
 * Module dependencies.
 */

var gaze = require('gaze'),
    path = require('path');

/**
 * AutoReload Middleware.
 *
 * Watches the file system for changes and notifies client.
 *
 * Options:
 *
 *   - `options` {Object}
 *     - `options.autoreload` {Boolean} to enable the middleware (default: true)
 */

module.exports = function(options) {
    var outdated = false,
        watches = [ path.join(process.cwd(), 'www/**/*') ];

    // optional options parameter
    options = options || {};
    if (typeof options.autoreload !== 'boolean')
        options.autoreload = true;

    // enable AutoReload
    if (options.autoreload) {
        var watch = new gaze.Gaze(watches);

        watch.on('error', function(e) {
            if (options.emitter) {
                options.emitter.emit('error', e);
            }
        });

        // flag as outdated on all local file system changes
        watch.on('all', function(event, filepath) {
            outdated = true;

            if (options.emitter) {
                options.emitter.emit('log', 'file changed', filepath);
            }
        });
    }

    // the app constantly polls the server checking for the outdated state
    // if the app detects the outdated state to be true, it will force a reload on the page
    return function(req, res, next) {
        if (req.url.indexOf('autoreload') >= 0) {
            if (req.method === 'GET') {
                res.writeHead(200, { 'Content-Type' : 'text/json' });
                res.end(JSON.stringify({ outdated : outdated }));
            }
            else if (req.method === 'POST'){
                res.writeHead(200, { 'Content-Type' : 'text/json' });
                outdated = false;
                res.end(JSON.stringify({ outdated : outdated }));
            }
        }
        else {
            next();
        }
    };
};
