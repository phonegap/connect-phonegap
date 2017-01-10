/**
 * Devmode Middleware
 *
 * When the new developer app registers with this middleware, it'll
 * set a few things to ensure autoreload works but also turns off
 * the injected scripts. In addition, it provides the appID back to
 * the client that requests it.
 *
 * This is mostly for backwards compat.
 *
 * Options:
 *
 *   - `options` {Object}
 */

module.exports = function(options) {
    // optional options parameter
    options = options || {};

    // return the appID to the client
    return function(req, res, next) {
        if (req.url.indexOf('/__api__/devmode') === 0) {
            // set devmode to be true so as not to inject the scripts in the later middleware
            options.isDevmode = true;

            res.writeHead(200, { 'Content-Type': 'text/json' });
            res.end(JSON.stringify({
                appID: options.appID
            }));
        }
        else {
            next();
        }
    };
};
