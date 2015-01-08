/*!
 * Module dependencies.
 */

var net = require('net'),
    ip = require('ip')
/**
 * Get the ip address of the current machine
 *
 * Creates a local server to serve up the project. The intended
 * receiver is the PhoneGap App but any browser can consume the
 * content.
 *
 * Arguments:
 *
 *   -  `callback` Function ( will be called with 2 args)  
 *
 * Return:
 *
 *   - nil
 *
 * Example:
 *
 *  getIP(function(err,ip){
 *      if(err) {
 *          console.log("Oops, this happened : " + err);
 *      }
 *      else {
 *          console.log("Got the ip! it is : " + ip);
 *      }
 *  });
 *
 */


module.exports.ipAddress = null;

module.exports = function(callback) {

    if(module.exports.ipAddress != null) {
        process.nextTick(function() {
            callback(null, module.exports.ipAddress);
        });
    }
    else {
        var socket = net.createConnection(80, 'www.google.com');
            socket.on('connect', function() {
                module.exports.ipAddress = socket.address().address;
                socket.end();
                if (module.exports.ipAddress == '127.0.0.1') {
                    module.exports.ipAddress = ip.address();
                }
                callback(null, module.exports.ipAddress);
            });

        socket.on('error', function(e) {
            callback(e);
        });
    }
}
