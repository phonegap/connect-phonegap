/*!
 * Module dependencies.
 */

var connect = require('connect'),
    path = require('path'),
    fs = require('fs'),
    cordova = require('./middleware/cordova'),
    mstatic = require('./middleware/static');

/**
 * Request listener.
 *
 * A request listener for `http.Server` that can also be used
 * as connect or express middleware.
 */

module.exports = function() {
    var app = connect();

    app.use(require('connect-inject')({
        snippet: '<script type="text/javascript">'+ fs.readFileSync(path.join(__dirname, '../res/middleware/reload/reload.js')) + '</script>'
    }));

    // serve static assets
    app.use(mstatic());

    // serve cordova js if 404'd out from previous static server
    app.use(cordova());

    // return the request listener
    return function(req, res, next) {
        app.handle(req, res, next);
    };
};
