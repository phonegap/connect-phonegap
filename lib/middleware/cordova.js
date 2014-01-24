/*!
 * Module dependencies.
 */

var path = require('path'),
    fs = require('fs');

/**
 * cordova.js middleware.
 *
 * Serves cordova.js or phonegap.js.
 *
 * Install this middleware after the static middleware to allow bundled
 * cordova.js or phonegap.js files to served first.
 */

module.exports = function() {
    // return the request listener
    return function(req, res, next) {
        if (req.url.indexOf('cordova.js') >= 0 || req.url.indexOf('phonegap.js') >= 0) {
            // assume ios only for now
            var cordovajs = fs.readFileSync(
                path.join(__dirname, '../../res/middleware/cordova/ios/cordova.js')
            );
            res.writeHead(200, { 'Content-Type': 'text/javascript' });
            res.end(cordovajs);
        } else {
            next();
        }
    };
};
