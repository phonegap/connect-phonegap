/*!
 * Module dependencies.
 */

var fs = require('fs'),
    useragent = require('./ext/useragent'),
    path = require('path');

/**
 * Middleware to track all connections
 *
 * Options:
 *
 *   - `options` {Object} contains all options available to other middleware.
 */

module.exports = function(options) {
    return function(req, res, next) {
        if (req.url.indexOf('/__api__/devices') === 0) {
            if (req.method === 'GET') {
                if(options.devices) {
                  //console.log("sending devices ", options.devices);
                  if (useragent.parse(req.headers['user-agent']).platform === 'browser') {
                      res.writeHead(200, { 'Content-Type': 'text/json' });
                      res.end(JSON.stringify({
                          devices: options.devices
                      }));
                  }
                } else {
                  //console.log("no devices", options.devices);
                  res.writeHead(200, { 'Content-Type': 'text/plain' });
                  res.end();
                }
            } else {
              next();
            }
        } else {
          next();
        }
    };
};
