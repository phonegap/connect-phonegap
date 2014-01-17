/*!
 * Module dependencies.
 */
 
var path = require('path'),
    fs = require('fs');

/**
 * cordova_plugins.js middleware.
 *
 * Serves the cordova_plugins.js file whenever it is missing.
 */

module.exports = function() {
    // return the request listener
    return function(req, res, next) {
        if (req.url.indexOf('cordova_plugins.js') >= 0) {
            // assume ios only for now
            var cordova_plugins = fs.readFileSync(
                path.join(__dirname, '../../res/middleware/cordova/ios/cordova_plugins.js')
            );
            
            res.writeHead(200, {'Content-Type': 'text/javascript'});
            res.end(cordova_plugins);
        } else {
            next();
        }
    };
};
