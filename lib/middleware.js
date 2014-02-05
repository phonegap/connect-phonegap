/*!
 * Module dependencies.
 */

var autoreload = require('./middleware/autoreload'),
    connect = require('connect'),
    cordova = require('./middleware/cordova'),
    cordova_plugins = require('./middleware/cordova_plugins'),
    fs = require('fs'),
    inject = require('./middleware/inject'),
    mstatic = require('./middleware/static'),
    nocache = require('./middleware/nocache'),
    path = require('path'),
    plugins = require('./middleware/plugins');

/**
 * Request listener.
 *
 * A request listener for `http.Server` that can also be used
 * as connect or express middleware.
 */

module.exports = function(options) {
    var app = connect();

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
