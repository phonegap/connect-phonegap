/*!
 * Module dependencies.
 */

var connect = require('connect'),
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

    // serve static assets
    app.use(mstatic());

    // serve cordova js if 404'd out from previous static server
    app.use(cordova());

    // return the request listener
    return function(req, res, next) {
        app.handle(req, res, next);
    };
};
