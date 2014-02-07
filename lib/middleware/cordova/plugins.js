/*!
 * Module dependencies.
 */
 
var fs = require('fs'),
    path = require('path'),
    useragent = require('../ext/useragent');

/**
 * plugins.js middleware.
 *
 * Serves the each of the cordova plugin files whenever it is missing.
 */

module.exports = function() {
    // return the request listener
    return function(req, res, next) {
        if (req.url.indexOf('plugins/') >= 0) {
            var agent = useragent.parse(req.headers['user-agent']),
                pluginPath = req.url.split('plugins/')[1],
                filepath = path.join(__dirname, '../../../res/middleware/cordova', agent.platform, 'plugins', pluginPath),
                data = fs.readFileSync(filepath);

            res.writeHead(200, { 'Content-Type': 'text/javascript' });
            res.end(data);
        } else {
            next();
        }
    };
};
