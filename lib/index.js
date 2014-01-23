/*!
 * Module dependencies.
 */

var middleware = require('./middleware'),
    http = require('http'),
    events = require('events'),
    emitter = new events.EventEmitter();

/**
 * Request Listener or Middleware.
 *
 * Returns a `Function` that can be provided to `http.Server` or
 * can act as `connect` middleware.
 *
 * Example:
 *
 *     var soundwave = require('phonegap-soundwave');
 *
 *     // use as middleware
 *     app.use(soundwave());
 *
 *     // use as request listener
 *     http.createServer(soundwave()).listen(3000);
 */

module.exports = middleware;

/**
 * Create a project.
 *
 * See module for documentation.
 */

module.exports.create = require('./create');

/**
 * Serve a PhoneGap app.
 *
 * Creates a local server to serve up the project. The intended
 * receiver is the PhoneGap App but any browser can consume the
 * content.
 *
 * Options:
 *
 *   - `options` {Object}
 *     - `[port]` {Number} is the server port (default: 3000).
 *     - `[autoreload]` {Boolean} toggle AutoReload watch (default: true).
 *   - `[callback]` {Function} is triggered when server starts.
 *     - `e` {Error} is null unless there is an error.
 *     - `data` {Object}
 *       - `server` {http.Server} is the server running.
 *       - `address` {String} is the server address.
 *       - `port` {Number} is the server port.
 */

module.exports.serve = function(options, callback) {
    var self = this;

    // require options
    if (!options) throw new Error('requires option parameter');

    // optional parameters
    options.port = options.port || 3000;
    callback = callback || function() {};

    // create the server
    var server = http.createServer(middleware(options));

    // bind error
    server.on('error', function(e) {
        module.exports.emit('error', e);
        callback(e);
    });

    // bind request
    server.on('request', function(req, res) {
        module.exports.emit('log', res.statusCode, req.url);
    });

    // bind complete
    server.on('listening', function() {
        module.exports.emit('log', 'listening on 127.0.0.1:' + options.port);
        callback(null, {
            server: server,
            address: '127.0.0.1',
            port: options.port
        });
    });

    // start the server
    return server.listen(options.port);
};

/**
 * Subscribe to the emit events
 *
 * Events: 
 *
 *      - "log" Emits status and url
 */

module.exports.on = emitter.on;

/**
 * Emits events
 */
 
module.exports.emit = emitter.emit;

/*!
 * Default error handler
 */
 
module.exports.on('error', function(e){});
