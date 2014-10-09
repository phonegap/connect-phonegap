/*!
 * Module dependencies.
 */

var autoreload = require('./middleware/autoreload'),
    connect = require('connect'),
    cordova = require('./middleware/cordova/cordova'),
    cordova_plugins = require('./middleware/cordova/cordova_plugins'),
    events = require('events'),
    fs = require('fs'),
    inject = require('./middleware/inject'),
    mstatic = require('./middleware/static'),
    nocache = require('./middleware/nocache'),
    cors = require('./middleware/cors'),
    zip = require('./middleware/zip'),
    path = require('path'),
    plugins = require('./middleware/cordova/plugins'),
    proxy = require('./middleware/proxy'),
    register = require('./middleware/register');

/**
 * Request Listener / Connect Middleware.
 *
 * Options:
 *
 *   - `[options]` {Object}
 *     - `[autoreload]` {Boolean} toggle AutoReload watch (default: true).
 *
 * Events:
 *
 *   - `error` is emitted when an error occurs.
 *   - `log` is emitted with log info.
 *
 * Return:
 *
 *   - {Function} request listener that can be provided to `http.Server` or
 *     used as `connect` middleware.
 *
 * Example:
 *
 *     var phonegap = require('connect-phonegap')(),
 *         middleware = phonegap();
 *
 *     // subscribe to events
 *     middleware.on('log', function() {
 *         console.log.apply(this, arguments);
 *     });
 *
 *     // use as middleware
 *     app.use(middleware);
 *
 *     // or
 *
 *     // use as request listener
 *     http.createServer(middleware).listen(3000);
 */

module.exports = function(options) {
    var app = connect(),
        emitter = new events.EventEmitter();

    // optional parameters
    options = options || {};
    options.emitter = emitter;

    // support POST JSON-encoded and URL-encoded queries
    app.use(connect.json());
    app.use(connect.urlencoded());

    // no-cache header
    app.use(nocache(options));

    // CORS headers
    app.use(cors());

    // sessions require the cookie parser
    app.use(connect.cookieParser());

    // register requires session support
    app.use(connect.session({ secret: 'phonegap' }));

    // watch file system for changes and notify client
    app.use(autoreload(options));

    // handle /register requests
    app.use(register(options));

    // handle /zip requests
    app.use(zip(options));

    // inject JavaScript to refresh app or navigate home
    app.use(inject(options));

    // serve static assets
    app.use(mstatic(options));

    // proxy cross-origin requests
    app.use(proxy(options));

    // serve cordova js if 404'd out from previous static server
    app.use(cordova(options));

    // serve cordova_plugin js if 404'd out from previous static server
    app.use(cordova_plugins(options));

    // serve plugins if 404'd out from previous static server
    app.use(plugins(options));

    // create request listener and attach event emitter interface
    var requestListener = function(req, res, next) {
        app.handle(req, res, next);
    };

    for(var property in emitter) {
        requestListener[property] = emitter[property];
    }

    return requestListener;
};
