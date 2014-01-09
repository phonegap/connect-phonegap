/*!
 * Module dependencies.
 */

var connect = require('connect'),
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

    // return the request listener
    return function(req, res, next) {
        app.handle(req, res, next);
    };
};
