/*!
 * Module dependencies.
 */

var connect = require('connect'),
    path = require('path'),
    fs = require('fs'),
    cordova = require('./middleware/cordova'),
    cordova_plugins = require('./middleware/cordova_plugins'),
    inject = require('./middleware/inject'),
    mstatic = require('./middleware/static'),
    nocache = require('./middleware/nocache'),
    plugins = require('./middleware/plugins'),
    reloader = require('./middleware/reloader');

/**
 * Request listener.
 *
 * A request listener for `http.Server` that can also be used
 * as connect or express middleware.
 */

module.exports = function(appState) {
    var app = connect();

    // no-cache header
    app.use(nocache());

    // check for changes to local file system and serve a reload signal to client
    app.use(reloader(appState));

    // inject JavaScript to refresh app or navigate home
    app.use(inject());

    // serve static assets
    app.use(mstatic());

    // serve cordova js if 404'd out from previous static server
    app.use(cordova());

    // serve cordova_plugin js if 404'd out from previous static server
    app.use(cordova_plugins());

    // serve plugins if 404'd out from previous static server
    app.use(plugins());
    
    // return the request listener
    return function(req, res, next) {
        app.handle(req, res, next);
    };
};
