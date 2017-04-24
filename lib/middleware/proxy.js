/*!
 * Module dependencies.
 */

var httpProxy = require('http-proxy'),
    parse_url = require('url').parse,
    proxy = new httpProxy.createProxyServer({
        changeOrigin: true,
        autoRewrite: true
    });

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
            var url = decodeURIComponent(req.url.replace(new RegExp('(/__api__)?/proxy/'), ''));
            var parsed_url = parse_url(url);
            var targetHost = parsed_url.protocol + '//' + parsed_url.host;

            // rebuild the location header, so browsers can follow them
            proxy.once('proxyRes', function (proxyRes, req, res) {
                if (proxyRes.headers.location) {
                    var parsed_location = parse_url(proxyRes.headers.location);
                    var new_proxy_url;
                    if (parsed_location.host) {
                        new_proxy_url = parsed_location.href;
                    } else {
                        // if server responded with a relative/absolute url (no hostname),
                        // fill in the hostname ourselves.
                        new_proxy_url = targetHost + parsed_location.path;
                    }
                    proxyRes.headers.location = 'http://' + req.headers.host + '/proxy/' + encodeURIComponent(new_proxy_url);
                }
            });

            req.url = url;
            proxy.web(req, res, { target: targetHost },
                function error(err, req, res) {
                    options.emitter.emit('error', 'Proxy error for url: ' + url, err.message);
                    // For connection errors, err.code will be a string like 'ENOTFOUND'
                    // Let's ensure code is numeric and >= 100, as that is what
                    // response's writeHead expects.
                    // TODO: perhaps it would be best to return HTTP 502 in the
                    // case that proxying fails?
                    res.writeHead(err.code && typeof err.code == 'number' && err.code >= 100 ? err.code : 500);
                    res.end(err.message);
                });
        }
        else {
            next();
        }
    };
};
