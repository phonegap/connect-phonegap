/*!
 * Module dependencies.
 */

var Static = require('node-static');

/**
 * Serve the App.
 *
 * Creates a local server to serve up the project. The intended
 * receiver is the PhoneGap App but any browser can consume the
 * content.
 *
 * Options:
 *
 *   - `options` {Object}
 *     - `[port]` {Number} is the server port (default: 3000).
 *   - `[callback]` {Function} is triggered when server starts.
 *     - `e` {Error} is null unless there is an error.
 */

module.exports.serve = function(options, callback) {
    var self = this,
        file = new Static.Server('./www');
        
    // require options
    if (!options) throw new Error('requires option parameter');

    // optional parameters
    options.port = options.port || 3000;
    callback = callback || function() {};
    
    // create the server
    var server = require('http').createServer(function (request, response) {
        // server the static file
        file.serve(request, response, function(e, response) {
            if (e) response = e; // e.status = 404
        });
    });

    // bind error
    server.on('error', function(e) {
        callback(e);
    });

    // bind complete
    server.on('listening', function() {
        callback(null, {
            address: '127.0.0.1',
            port: options.port
        });
    });

    // start the server
    server.listen(options.port);
};
