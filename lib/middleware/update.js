/*!
 * Module dependencies.
 */

/**
 * Middleware to compress the changes to the project as a delta update
 *
 * Options:
 *
 *   - `options` {Object}
 *   - `options.req` {Object} is the request object (for session access).
 */

module.exports = function(options) {
    return function(req, res, next) {
        if (req.url.indexOf('/__api__/update') === 0) {
            res.writeHead(200, { 'Content-Type': 'text/json' });
            response = req.session.filesToUpdate;
            res.end(JSON.stringify(req.session));
        } 
        else {
            next();
        }
    }
};