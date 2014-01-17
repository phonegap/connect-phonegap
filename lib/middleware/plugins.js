/*!
 * Module dependencies.
 */
 
var path = require('path'),
    fs = require('fs');

/**
 * plugins.js middleware.
 *
 * Serves the each of the cordova plugin files whenever it is missing.
 */

module.exports = function() {
    // return the request listener
    return function(req, res, next) {
        if (req.url.indexOf('plugins/') > 0) {
        
            // assume ios only for now
            var new_path = req.url.split('plugins/')[1];
            var the_plugin = fs.readFileSync(
                path.join(__dirname, '../../res/middleware/cordova/ios/plugins', new_path)
            );
            
            res.writeHead(200, {'Content-Type': 'text/javascript'});
            res.end(the_plugin);
        }else{
            next();
        }
    };
};
