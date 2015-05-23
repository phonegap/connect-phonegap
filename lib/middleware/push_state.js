/*!
 * Module dependencies.
 */
var fs = require('fs');
var path = require('path');

/**
 * Push state asset middleware.
 *
 * Serves the index.html file. Should be used as the last middleware,
 * when no other middleware completes the request
 */

module.exports = function(options) {
    if(options.pushState === false) {
      return function(req, res, next) {
        next();
      }
    }

    return function(req, res, next) {
      res.writeHead(200, { 'Content-Type': 'text/html' });
      fs.createReadStream(path.join(process.cwd(), 'www', 'index.html'), 'utf-8').pipe(res);
    }
};
