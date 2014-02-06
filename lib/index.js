/*!
 * Module dependencies.
 */

var address = require('address'),
    events = require('events'),
    http = require('http'),
    middleware = require('./middleware'),
    emitter = new events.EventEmitter();

/**
 * See modules for documentation.
 */

module.exports = middleware;
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
 *     - `[emitter]` {EventEmitter} allows event notification.
 *   - `[callback]` {Function} is triggered when server starts.
 *     - `e` {Error} is null unless there is an error.
 *     - `data` {Object}
 *       - `server` {http.Server} is the server running.
 *       - `address` {String} is the server address.
 *       - `port` {Number} is the server port.
 *
 * Events:
 *
 *   - `error` is emitted when an error occurs.
 *   - `log` is emitted with server log info.
 *
 * Return:
 *
 *   - {http.Server} instance that is also an event emitter.
 */

module.exports.serve = function(options, callback) {
    var self = this;

    // require options
    if (!options) throw new Error('requires option parameter');

    // optional parameters
    options.port = options.port || 3000;
    options.emitter = options.emitter || new events.EventEmitter();
    callback = callback || function() {};

    // create the server
    var server = http.createServer(middleware(options));

    // bind error
    server.on('error', function(e) {
        callback(e);
    });

    // bind request
    server.on('request', function(req, res) {
        server.emit('log', res.statusCode, req.url);
    });

    // bind complete
    server.on('listening', function() {
        var data = {
            address: address.ip(),
            port: options.port,
            server: server
        };

        server.emit('log', 'listening on', data.address + ':' + data.port);
        callback(null, data);
    });

    // bind emitter to server
    options.emitter.on('error', function() {
        var args = Array.prototype.slice.call(arguments);
        args.unshift('error');
        server.emit.apply(server, args);
    });

    options.emitter.on('log', function() {
        var args = Array.prototype.slice.call(arguments);
        args.unshift('log');
        server.emit.apply(server, args);
    });

    // start the server
    return server.listen(options.port);
};
