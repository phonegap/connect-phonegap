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
            
            // the host header cannot be forwarded and causes request to fail
            delete req.headers.host;
            
            //this header can't be forwarded aswell - when sending object as data in ajax
            //with string as data in ajax, it works without deleting
            delete req.headers['content-length'];
            
            
            var body;

            // request requires the body to be of type string or array
            if (req.headers['content-type'].indexOf('application/json')>=0) {
                //content type always have encoding, that's why check for index (substring match) 
                //and not string comparison

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
