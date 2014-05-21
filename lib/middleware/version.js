/*!
 * Module dependencies.
 */

var querystring = require('querystring'),
    url = require('url');

/**
 * Middleware to Check Supported Versions of Cordova.
 *
 * The middleware allows you to get a list of all supports Cordova platforms
 * and version. You can also query for a specific platform and version.
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
        if (req.url.indexOf('/version') >= 0) {
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
            }

            res.writeHead(200, { 'Content-Type': 'text/json' });
            res.end(JSON.stringify(response));
        }
        else {
            next();
        }
    };
};
