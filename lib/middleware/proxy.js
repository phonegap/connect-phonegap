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
            //var proxy = request(url);
            //DON'T KNOW WHY BUT THIS HAS TO BE DELETED
            delete req.headers.host;

            var body;

            //AS STATED IN REQUEST DOCUMENTATION, body MUST BE STRING OR ARRAY
            if(req.headers['content-type']=='application/json') {

                body=JSON.stringify(req.body);

            }else{

                body = Object.keys(req.body).map(function (k) {
                    return k + '=' + req.body[k]
                }).join('&');

            }

            var proxy = request({
                method: req.method
                , uri: url
                , body:body
                ,headers:req.headers
            });

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
