/*!
 * Module dependencies.
 */

var request = require('request'),
    httpProxy = require('http-proxy'),
	util = require('util'),
    proxy = new httpProxy.createServer({
		changeOrigin: true,
		hostRewrite: true
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

            var url = decodeURIComponent(req.url.replace('/proxy/', ''));
			var targetHost = url.substring(0, url.indexOf('/', 8));
			var path = url.substring(url.indexOf('/', 8), url.length);
			
			// Rewrite the path to not include the /proxy/ prefix
			proxy.once('proxyReq', function (proxyReq, req, res) {
				proxyReq.path = path;
			});
			
			// Re-Build the location header, so browsers can follow them
            proxy.once('proxyRes', function (proxyRes, req, res) {
                if (proxyRes.headers.location)
                    proxyRes.headers.location = 'http://' + req.headers.host + '/proxy/' + targetHost + proxyRes.headers.location;
            });
			
			proxy.web(req, res, { 'target': targetHost },
                function error(err, req, res) {					
                    options.emitter.emit('log', 'Proxy error for url: ' + url, error.message);
                    res.writeHead(err.code || 500);
                    res.end(error.message);
            	}
			);

        }
        else {
            next();
        }
    };
};
