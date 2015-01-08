/*!
 * Module dependencies.
 */

var net = require('net'),
    ip = require('ip');

/**
 * Get IP address of local machine.
 *
 * Creates a local server to serve up the project. The intended
 * receiver is the PhoneGap App but any browser can consume the
 * content.
 *
 * Arguments:
 *
 *   - `callback` {Function} will be triggered on competion.
 *     - `e` {Error} is null unless there is an error.
 *     - `address` {String} is the IP address.
 *
 * Example:
 *
 *    getIP(function(e, address) {
 *        if (e) {
 *            console.log('error:', e);
 *        }
 *        else {
 *            console.log('IP address:', address);
 *        }
 *    });
 */

module.exports = function(callback) {
    if (module.exports.ipAddress !== null) {
        process.nextTick(function() {
            callback(null, module.exports.ipAddress);
        });
    }
    else {
        var socket = net.createConnection(80, 'www.google.com');
            socket.on('connect', function() {
                module.exports.ipAddress = socket.address().address;
                socket.end();
                if (module.exports.ipAddress === '127.0.0.1') {
                    module.exports.ipAddress = ip.address();
                }
                callback(null, module.exports.ipAddress);
            });

        socket.on('error', function(e) {
            callback(e);
        });
    }
};

module.exports.address = module.exports;

/**
 * Cache IP Address.
 */

module.exports.ipAddress = null;
