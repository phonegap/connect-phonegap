/*!
 * Module dependencies.
 */

var fs = require('fs'),
    path = require('path'),
    useragent = require('../ext/useragent');

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
            var agent = useragent.parse(req.headers['user-agent']),
                filepath = path.join(__dirname, '../../../res/middleware/cordova', agent.platform, 'cordova.js'),
                data = fs.readFileSync(filepath);

            res.writeHead(200, { 'Content-Type': 'text/javascript' });
            res.end(data);
        } else {
            next();
        }
    };
};
