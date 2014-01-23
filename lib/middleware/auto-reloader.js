/*!
 * Module dependencies.
 */

var path = require('path'),
    gaze = require('gaze');

/**
 * Middleware to handle auto-reload.
 *
 * Serves updated content from the www/
 */

module.exports = function() {
    var watches = [path.join(process.cwd(), 'www/*')],
        watch = new gaze.Gaze(watches),
        outdated = false;

    watch.on('ready', function(watcher) {
    });

    // the outdated state is set to true when a change in the local file system is made
    watch.on('all', function(event, filepath) {
        outdated = true;
    });

    // the app constantly polls the server checking for the outdated state
    // if the app detects the outdated state to be true, it will force a reload on the page
    return function(req, res, next) {
        if (req.url.indexOf('autoreload') >= 0) {
            res.writeHead(200, { 'Content-Type' : 'text/json' });
            res.end(JSON.stringify({ outdated : outdated }));
            outdated = false;
        } else {
            next();
        }
    };
};
