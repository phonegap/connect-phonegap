/*!
 * Module dependencies.
 */

var request = require('request');

/**
 * Cross-Origin Requests Middleware.
 *
 * Add support for cross-origin resource requests by proxying all of the requests
 * through this route. Each request includes an encoded path that is the original
 * URL.
 *
 * Options:
 *
 *   - `options` {Object} is unused.
 */

module.exports = function(options) {
    return function(req, res, next) {
        if (req.url.indexOf('/__api__/proxy/') === 0 || req.url.indexOf('/proxy/') === 0) {
            var url = decodeURIComponent(req.url.replace('/proxy/', ''));
            var proxy = request(url);

            proxy.on('error', function(error){
                options.emitter.emit('log', 'Proxy error: url: ' + url, error.code);
            });

            req.pipe(proxy);
            proxy.pipe(res);
        }
        else {
            next();
        }
    };
};
