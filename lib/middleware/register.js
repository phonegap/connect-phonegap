/*!
 * Module dependencies.
 */

var querystring = require('querystring'),
    url = require('url'),
    useragent = require('./ext/useragent');

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
    var cordova = {
        '3.2.0': {
            'android': false,
            'ios': false,
            'wp8': true      // PG App 1.0.0
        },
        '3.4.0': {
            'android': true, // PG App 1.0.0
            'ios': true,     // PG App 1.0.0
            'wp8': false
        }
    };

    return function(req, res, next) {
        // set default session value for device
        if (req.session && !req.session.device) {
            req.session.device = {
                platform: useragent.parse(req.headers['user-agent']).platform,
                version: '3.4.0'
            };

            if (req.session.device.platform === 'wp8') {
                req.session.device.version = '3.2.0';
            }
        }

        // GET /register
        if (req.url.indexOf('/register') >= 0) {
            var uri = url.parse(req.url),
                query = querystring.parse(uri.query),
                response = cordova;

            // request includes a platform version query
            if (query.platform && query.version) {
                // window.device.platform may contain capitalization
                query.platform = query.platform.toLowerCase();

                // normalize Windows Phone 8 (reported as Win32NT) to WP8.
                if (query.platform === 'win32nt') {
                    query.platform = 'wp8';
                }

                // check if we support the platform's cordova version
                response.supported = !!(cordova[query.version] &&
                                       (cordova[query.version][query.platform]));

                // register the device
                if (response.supported) {
                    req.session.device = {
                        platform: query.platform,
                        version: query.version
                    };
                }
            }

            res.writeHead(200, { 'Content-Type': 'text/json' });
            res.end(JSON.stringify(response));
        }
        else {
            next();
        }
    };
};
