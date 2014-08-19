/*!
 * Module dependencies.
 */

var useragent = require('./useragent');

/**
 * Session storage for the more complex parts.
 */

module.exports = {};

/**
 * Session storage for each device.
 *
 * Set and get the device information from session storage.
 */

module.exports.device = {
    init: function(req) {
        // set default session value for device
        // default values are those shipped with PhoneGap Developer App 1.0.0
        if (req.session && !req.session.device) {
            req.session.device = {
                platform: useragent.parse(req.headers['user-agent']).platform,
                version: '3.2.0'
            };

            if (req.session.device.platform === 'android') {
                req.session.device.version = '3.4.0';
            }
        }
    },
    set: function(req, query) {
        var response = {
            available: module.exports.device.available()
        };

        // request includes a platform version query
        if (query && query.platform && query.version) {
            // window.device.platform may contain capitalization
            query.platform = query.platform.toLowerCase();

            // normalize Windows Phone 8 (reported as Win32NT) to WP8.
            if (query.platform === 'win32nt') {
                query.platform = 'wp8';
            }

            // check if we support the platform's cordova version
            var supported = !!(response.available[query.version] &&
                              (response.available[query.version][query.platform]));

            // register the device
            if (supported) {
                response.current = {
                    platform: query.platform,
                    version: query.version
                };
                req.session.device = response.current;
            }
            else {
                response.error = 'Unsupported platform and version combination: ' +
                                 query.platform + '@' + query.version;
            }
        }

        return response;
    },
    available: function() {
        return  {
            '3.2.0': {
                'android': false,
                'ios': true,     // PG App 1.0.0
                'wp8': true      // PG App 1.0.0
            },
            '3.4.0': {
                'android': true, // PG App 1.0.0
                'ios': false,
                'wp8': false
            },
            '3.5.0': {
                'android': true, // PG App 1.1.0
                'ios': true,     // PG App 1.1.0
                'wp8': true      // PG App 1.1.0
            },
            '3.5.1': {
                'android': true, // PG App 1.3.0
                'ios': false,
                'wp8': false
            }
        };
    }
};
