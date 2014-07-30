/*!
 * Module dependencies.
 */

var autoreload = require('./middleware/autoreload'),
    connect = require('connect'),
    cordova = require('./middleware/cordova'),
    events = require('events'),
    fs = require('fs'),
    inject = require('./middleware/inject'),
    mstatic = require('./middleware/static'),
    nocache = require('./middleware/nocache'),
    path = require('path'),
    proxy = require('./middleware/proxy'),
    register = require('./middleware/register');

/**
 * Request Listener / Connect Middleware.
 *
 * Options:
 *
 *   - `[options]` {Object}
 *     - `[autoreload]` {Boolean} toggle AutoReload watch (default: true).
 *     - `[sessionSecret]`  {String} Server session secret (default: 'phonegap').
 *     - `[watches]`		{Array} File patterns that trigger reload (default: `www/**`).
 *     - `[vdir]`		{Object} Override www and <platform> virtual directories
 *       - `[www]`			{String} root directory containing HTML5 files.  (default: 'www')
 *       - `<platform>`		{String} directory containing Android Javascript.  (default: `<module>/res/middleware/codova/<version>/<platform>`) 
 *
 *  where
 *      <module>   = directory where this module is installed typically `node_modules/connect-phonegap`
 *      <platform> = 'android' or 'ios' or 'wp8' etc.
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

    // sessions require the cookie parser
    app.use(connect.cookieParser());

    // register requires session support
    app.use(connect.session({ secret: options.sessionSecret || 'phonegap' }));
     
    // handle /register requests
    app.use(register(options));

    // watch file system for changes and notify client
    app.use(autoreload(options));

    // inject JavaScript to refresh app or navigate home
    app.use(inject(options));

    // serve static assets
    app.use(mstatic(options));

    // proxy cross-origin requests
    app.use(proxy(options));

    // serve cordova.js, phonegap.js, cordova_plugins.js or plugins/* if 404'd from 'mstatic' static server
    app.use(cordova(options));

    // create request listener and attach event emitter interface
    var requestListener = function(req, res, next) {
        app.handle(req, res, next);
    };

    for(var property in emitter) {
        requestListener[property] = emitter[property];
    }

    return requestListener;
};
