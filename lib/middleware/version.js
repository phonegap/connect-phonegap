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
        '3.2.0': [ 'wp8' ],
        '3.4.0': [ 'android' ],
        '3.4.1': [ 'ios' ]
    };

    return function(req, res, next) {
        if (req.url.indexOf('/version') >= 0) {
            var uri = url.parse(req.url),
                query = querystring.parse(uri.query),
                response = cordova;

            if (query.platform && query.version) {
                // window.device.platform may contain capitalization
                query.platform = query.platform.toLowerCase();

                // Normalize Windows Phone 8 (reported as Win32NT) to WP8.
                if (query.platform === 'win32nt') {
                    query.platform = 'wp8';
                }

                response.supported = !!(cordova[query.version] &&
                                       (cordova[query.version].indexOf(query.platform) >= 0));
            }

            res.writeHead(200, { 'Content-Type': 'text/json' });
            res.end(JSON.stringify(response));
        }
        else {
            next();
        }
    };
};
