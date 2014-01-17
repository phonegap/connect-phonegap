/*!
 * Module dependencies.
 */

var connect = require('connect'),
    path = require('path'),
    fs = require('fs'),
    cordova = require('./middleware/cordova'),
    mstatic = require('./middleware/static'),
    inject = require('./middleware/inject'),
    cordova_plugins = require('./middleware/cordova_plugins'),
    plugins = require('./middleware/plugins');

/**
 * Request listener.
 *
 * A request listener for `http.Server` that can also be used
 * as connect or express middleware.
 */

module.exports = function() {
    var app = connect();

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
