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
        if (req.session && !req.session.device) {
            req.session.device = {
                platform: useragent.parse(req.headers['user-agent']).platform,
                version: '3.4.0'
            };

            if (req.session.device.platform === 'wp8') {
                req.session.device.version = '3.2.0';
            }
        }
    },
    set: function(query) {
        var response = module.exports.device.supports();

        // request includes a platform version query
        if (query.platform && query.version) {
            // window.device.platform may contain capitalization
            query.platform = query.platform.toLowerCase();

            // normalize Windows Phone 8 (reported as Win32NT) to WP8.
            if (query.platform === 'win32nt') {
                query.platform = 'wp8';
            }

            // check if we support the platform's cordova version
            response.supported = !!(response[query.version] &&
                                   (response[query.version][query.platform]));

            // register the device
            if (response.supported) {
                req.session.device = {
                    platform: query.platform,
                    version: query.version
                };
            }
        }

        return response;
    },
    supports: function() {
        return  {
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
    }
};
