/*!
 * Module dependencies.
 */

var httpProxy = require('http-proxy'),
    proxy = new httpProxy.createProxyServer();

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

            var url = decodeURIComponent(req.url.replace('/proxy/', '')),
                targetHost = url.substring(0, url.indexOf('/', 8));

            //Re-Build the location header, so browsers can follow them
            proxy.once('proxyRes', function (proxyRes, req, res) {
                if (proxyRes.headers.location)
                    proxyRes.headers.location = 'http://' + req.headers.host + '/proxy/' + targetHost + proxyRes.headers.location;
            });

            //Re-Build the set-cookie header
            proxy.on('proxyRes', function(proxyRes, req, res){
	            if (proxyRes.headers['set-cookie'] && !proxyRes.$changed) {
	                var cookies = proxyRes.headers['set-cookie'];

	                var changed = [];

	                for ( var i = 0; i < cookies.length; i++ ) {
		                var cookie = cookies[i];

		                // remove domain
		                cookie = cookie.replace(/\s*domain=([^;]+);?/i, '');

						// replace path
						cookie = cookie.replace(/path=([^;]+)(;?)/i, 'path=/proxy/$2');

		                changed.push(cookie);
	                }

	                proxyRes.headers['set-cookie'] = changed;
	                proxyRes.$changed = true;
                }
            });

            req.url = url;
            delete req.headers.host;
            proxy.web(req, res, { target: targetHost },
                function error(err, req, res) {
                    options.emitter.emit('log', 'Proxy error for url: ' + url, error.message);
                    res.writeHead(err.code || 500);
                    res.end(error.message);
            });

        }
        else {
            next();
        }
    };
};
