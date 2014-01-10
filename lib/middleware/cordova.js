/*!
 * Module dependencies.
 */
 
var path = require('path'),
    fs = require('fs');
    
/**
 * cordova.js middleware.
 *
 * Serves the cordova.js file whenever it is missing.
 */

module.exports = function() {
    // return the request listener
    return function(req, res, next) {
        if(req.url.indexOf('cordova.js')>0){
            // assume ios only for now - figure out other platforms and how to handle later
            req.url = path.join(__dirname, '../../res/middleware/cordova/cordova.ios.js');
            var cordovajs = fs.readFileSync(req.url);
            res.writeHead(200, {'Content-Type': 'text/javascript'});
            res.end(cordovajs);
        }else{
            next();
        }
    };
};