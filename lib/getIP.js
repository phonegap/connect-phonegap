/*!
 * Module dependencies.
 */

var net = require('net');

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


var ipAddress = null;

module.exports = function(callback) {

    if(ipAddress != null) {
        process.nextTick(function() {
            callback(null,ipAddress);
        });
    }
    else {
        var socket = net.createConnection(80, 'www.google.com');
            socket.on('connect', function() {
                ipAddress = socket.address().address;
                socket.end();
                callback(null,ipAddress);
            });

        socket.on('error', function(e) {
            callback(e);
        });
    }
}