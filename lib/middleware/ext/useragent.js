/*!
 * Module dependencies.
 */

var useragent = require('useragent');

/**
 * Parse User-Agent for Cordova Platform.
 *
 * Options:
 *
 *   - `ua` {String} is the server request user-agent header.
 *   - `[jsUA]` {String} is the optional user-agent from the client-side JS.
 *
 * Returns:
 *
 *   - {Object} to describe the platform.
 *     - `ios` {Boolean} true when iOS.
 *     - `android` {Boolean} true when Android.
 *     - `platform` {String} is the platform name (`ios`, `android`, etc).
 */

module.exports.parse = function() {
    var agent = useragent.parse.apply(useragent, arguments),
        browser = agent.toAgent(),
        platform = {};

    // find the user-agent's platform
    platform = {
        android: /Android/i.test(browser),
        ios: /Mobile Safari/i.test(browser),
        windows: /Windows Phone/i.test(browser),
        platform: 'unknown'
    };

    // .platform is the stringified platform name
    for (var key in platform) {
        if (platform[key]) {
            platform.platform = key;
            break;
        }
    }

    return platform;
};
