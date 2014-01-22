/*!
 * Module dependencies.
 */
 
var path = require('path'),
    Gaze = require('gaze').Gaze;
    
/**
 * Middlware to handle auto reload 
 *
 * Serves updated content from the www/
 */

var watches = [path.join(process.cwd(), 'www/*')],
    watch = new Gaze(watches)
    outdated = false;

watch.on('ready', function(watcher) {
});

watch.on('all', function(event, filepath) { 
    outdated = true;
});
 
module.exports = function() {
    return function(req, res, next) {
        if (req.url.indexOf('autoreload') >= 0) {
            res.writeHead(200, { 'Content-Type' : 'text/json' });
            res.end(JSON.stringify({ reload : outdated }));
            outdated = false;
        } else {
            next();
        }
    };
};
