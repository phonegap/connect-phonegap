/*!
 * Module dependencies.
 */

var autoreload = require('./middleware/autoreload'),
    connect = require('connect'),
    cordova = require('./middleware/cordova'),
    cordova_plugins = require('./middleware/cordova_plugins'),
    events = require('events'),
    fs = require('fs'),
    inject = require('./middleware/inject'),
    mstatic = require('./middleware/static'),
    nocache = require('./middleware/nocache'),
    path = require('path'),
    plugins = require('./middleware/plugins');

/**
 * Request Listener / Connect Middleware.
 *
 * Options:
 *
 *   - `[options]` {Object}
 *     - `[emitter]` {EventEmitter} to subscribe to notifications.
 *
 * Return:
 *
 *   - {Function} request listener that can be provided to `http.Server` or
 *     used as `connect` middleware.
 *
 * Example:
 *
 *     var phonegap = require('connect-phonegap');
 *
 *     // use as middleware
 *     app.use(phonegap());
 *
 *     // use as request listener
 *     http.createServer(phonegap()).listen(3000);
 */

module.exports = function(options) {
    var app = connect();

    // optional parameters
    options = options || {};
    options.emitter = options.emitter || new events.EventEmitter();

    // no-cache header
    app.use(nocache(options));

    // watch file system for changes and notify client
    app.use(autoreload(options));

    // inject JavaScript to refresh app or navigate home
    app.use(inject(options));

    // serve static assets
    app.use(mstatic(options));

    // serve cordova js if 404'd out from previous static server
    app.use(cordova(options));

    // serve cordova_plugin js if 404'd out from previous static server
    app.use(cordova_plugins(options));

    // serve plugins if 404'd out from previous static server
    app.use(plugins(options));

    // return the request listener
    return function(req, res, next) {
        app.handle(req, res, next);
    };
};
