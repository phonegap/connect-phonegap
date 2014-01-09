/*!
 * Module dependencies.
 */

var connect = require('connect'),
    path = require('path');

/**
 * Request listener.
 *
 * A request listener for `http.Server` that can also be used
 * as connect or express middleware.
 */

module.exports = function() {
    var app = connect();

    // middleware components for streaming an app
    app.use(connect.static(path.join(process.cwd(), 'www')));

    // return the request listener
    return function(req, res, next) {
        app.handle(req, res, next);
    };
};
