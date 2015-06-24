/*!
 * Module dependencies.
 */

var gaze = require('gaze'),
    path = require('path')
    dict = require('dict');

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
    var lastModified = Date.now(),
        watches = [ path.join(process.cwd(), 'www/**/*') ],
        activeSessions = dict();

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
            lastModified = Date.now();

            // make sure each session has a list of files they need to update
            activeSessions.forEach(function(value, key) {
                if(value.indexOf(filepath) < 0) {
                    value.push(filepath);
                }
            });

            if (options.emitter) {
                options.emitter.emit('log', 'file changed', filepath);
            }
        });
    }

    // the app constantly polls the server checking for the outdated state
    // if the app detects the outdated state to be true, it will force a reload on the page
    return function(req, res, next) {
        if (req.url.indexOf('/__api__/autoreload') === 0) {
            if (req.method === 'GET') {
                // by default, lastUpdated is undefined.
                // on the first non-autoreload request, it is timestamped.
                // when the first request is to autoreload, we timestamp
                // it to 0 because no content has ever been retrieved,
                // which means that the content on the device is out-of-date.
                if (!req.session.lastUpdated) {
                    req.session.lastUpdated = 0;
                }

                // create a dict to help keep manage which files need to be updates across sessions
                if(!req.session.filesToUpdate) {
                    req.session.filesToUpdate = [];

                    if(!activeSessions.has(req.sessionID)) {
                        activeSessions.set(req.sessionID, req.session.filesToUpdate);
                    }
                }
            }
            else if (req.method === 'POST'){
                req.session.lastUpdated = Date.now();
            }

            res.writeHead(200, { 'Content-Type': 'text/json' });

            // if session has the latest - clear out active files, otherwise update the list
            // of files
            if(req.session.lastUpdated === lastModified) {
                req.session.filesToUpdate = [];
            }
            else {
                console.log('file to update: ' + activeSessions.get(req.sessionID));
                req.session.filesToUpdate = activeSessions.get(req.sessionID);
            }

            res.end(JSON.stringify({
                content: {
                    lastModified: lastModified,
                    lastUpdated: req.session.lastUpdated,
                    outdated: (req.session.lastUpdated < lastModified)
                }
            }));
        }
        else {
            // when lastUpdated is undefined, set it as up-to-date
            // since a legit resource request is going through
            if (!req.session.lastUpdated) {
                req.session.lastUpdated = Date.now();
            }
            next();
        }
    };
};
