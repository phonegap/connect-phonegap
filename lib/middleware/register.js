/*!
 * Module dependencies.
 */

var session = require('./ext/session');
var devices = require('../util/devices');

/**
 * Middleware to register a device.
 *
 * When a device connects to the server, a session is created.
 * The sessions will store the device's platform and cordova version, so
 * that the server can provide the proper files.
 * The device can explicitly register itself with the server or implicitly
 * have the server detect the platform and make an assumption about the
 * cordova version.
 *
 * Options:
 *
 *   - `options` {Object} is unused.
 */

module.exports = function(options) {
    return function(req, res, next) {
        // initialize device values unless already set
        session.device.init(req);

        // POST /__api__/register
        if (req.url.indexOf('/__api__/register') === 0 && req.method === 'POST') {
            var response = {};

            if (!req.body.platform) {
                response.error = 'missing the parameter: platform';
            }
            else if (!req.body.version) {
                response.error = 'missing the parameter: version';
            }
            else {
                response = session.device.set(req, req.body);
            }

            res.writeHead(200, { 'Content-Type': 'text/json' });
            res.end(JSON.stringify(response));
        }
        else {
            if(req.session && req.session.device && req.session.device.platform !== "browser") {
              options.devices = options.devices || [];

              var curAddress = req.connection.remoteAddress.replace(/^.*:/, '') + ":1234";


              if(devices.findDeviceIdx(options, curAddress) === -1) {
                options.devices.push({
                  ipaddress: curAddress,
                  device: req.session.device
                });

            //    options.emitter.emit('log', 'adding device: ', req.session.device, curAddress);
              }
            }
            next();
        }
    };
};
