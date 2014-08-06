/*!
 * Module dependencies.
 */

var events = require('events'),
    http = require('http'),
    localtunnel = require('localtunnel'),
    middleware = require('./middleware'),
    getIP = require('./getIP'),
    socketServer = require('./socket-server'),
    emitter = new events.EventEmitter();

/**
 * Serve a PhoneGap app.
 *
 * Creates a local server to serve up the project. The intended
 * receiver is the PhoneGap App but any browser can consume the
 * content.
 *
 * Options:
 *
 *   - `[options]` {Object}
 *     - `[port]` {Number} is the server port (default: 3000).
 *     - all options available to phonegap() middleware.
 *
 * Events:
 *
 *   - `complete` is triggered when server starts.
 *     - `data` {Object}
 *       - `server` {http.Server} is the server running.
 *       - `address` {String} is the server address.
 *       - `port` {Number} is the server port.
 *   - `error` trigger when there is an error with the server or request.
 *     - `e` {Error} is null unless there is an error.
 *   - all events available to phonegap() middleware.
 *   - all events available to `http.Server`
 *
 * Return:
 *
 *   - {http.Server} instance that is also an event emitter.
 *
 * Example:
 *
 *     phonegap.listen()
 *             .on('complete', function(data) {
 *                 // server is now running
 *             })
 *             .on('error', function(e) {
 *                 // an error occured
 *             });
 */

module.exports = function(options) {
    var self = this;

    // optional parameters
    options = options || {};
    options.port = options.port || 3000;

    // create the server
    var pg = middleware(options),
        server = http.createServer(pg);

    socketServer.attachConsole(server);

    // bind error
    server.on('error', function(e) {
        // bind to avoid crashing due to no error handler
    });

    // bind request
    server.on('request', function(req, res) {
        res.on('finish', function() {
            server.emit('log', res.statusCode, req.url);
        });
    });

    // bind complete
    server.on('listening', function() {
        var data = {
            address:"unknown",
            port: options.port,
            server: server
        };

        getIP(function(err,ipAddress) {
            if(err) {
                console.log("Error:" + err);
            }
            else {
                data.address = ipAddress;
            }
            // Note: it is still possible that this is not an error, it could be a private network ....
            // in this case the user will have to know what ip to use.
            server.emit('log', 'listening on', data.address + ':' + data.port);
            server.emit('complete', data);
        });

        if(options.localtunnel) {
            localtunnel(data.port, function(err, tunnel) {
                if (err) {
                    server.emit('error', 'Error in localtunnel ', err);
                }
                else {
                    server.emit('log', 'localtunnel :', tunnel.url);
                }
            });
        }

    });

    // bind emitter to server
    pg.on('error', function() {
        var args = Array.prototype.slice.call(arguments);
        args.unshift('error');
        server.emit.apply(server, args);
    });

    pg.on('log', function() {
        var args = Array.prototype.slice.call(arguments);
        args.unshift('log');
        server.emit.apply(server, args);
    });

    // start the server
    return server.listen(options.port);
};
