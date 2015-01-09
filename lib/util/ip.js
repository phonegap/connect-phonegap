/*!
 * Module dependencies.
 */

var ip = require('ip'),
    request = require('request');

/**
 * Get IP address of local machine.
 *
 * Finds and returns the IP address of the network adapter used to communicate
 * with the Internet. We cannot simply use the first network adapters IP address,
 * because some virtual machines and specifically the Windows Phone simulator
 * will add their own network adapters. Often the network adapters are arranged
 * alphabetically, so the first adapter may not be a valid address.
 *
 * Our solution is to attempt to ping an external address and then lookup
 * the local address used to make the request. If this fails - because the
 * external service is unavailable or the user is not connected to the Internet -
 * then we fallback on the first adapter's address.
 *
 * Arguments:
 *
 *   - `callback` {Function} will be triggered on competion.
 *     - `e` {Error} is null unless there is an error.
 *     - `address` {String} is the IP address.
 *
 * Example:
 *
 *    ip.address(function(e, address) {
 *        console.log('error:', e);
 *        console.log('IP address:', address);
 *    });
 */

module.exports.address = function(callback) {
    request.get('http://google.com/', function(e, res, data) {
        // error will occur when there is no network, no internet, or
        // no response from the server (e.g. invalid DNS)
        if (e) {
            return callback(null, ip.address());
        }
        callback(null, res.req.connection.localAddress);
    });
};
