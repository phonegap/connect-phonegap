/*!
 * Module dependencies.
 */

var connect = require('connect');

/**
 * Request listener.
 *
 * A request listener for `http.Server` that can also be used
 * as connect or express middleware.
 */

module.exports = function() {
    var app = connect();

    // add more middleware here
    //
    //app.use(function(req, res, next) {
    //  console.log('middleware #1');
    //  next();
    //});

    // return the request listener
    return function(req, res, next) {
        app.handle(req, res, next);
    };
};
