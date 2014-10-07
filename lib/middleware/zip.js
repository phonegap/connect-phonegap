/*!
 * Module dependencies.
 */
 
var fs = require('fs'),
    zip = require('./ext/generate-zip'),
    shell = require('shelljs');

/**
 * Middleware to compress the app as a zip archive.
 *
 * Starting in PhoneGap Developer App 1.4.0, a zip archive is returned
 * to the client. The client will uncompress this archive to deploy the
 * app on the device. This middleware will compress and return the archive
 * on each request.
 *
 * Options:
 *
 *   - `options` {Object}
 *   - `options.req` {Object} is the request object (for session access).
 */

module.exports = function(options) {
    return function(req, res, next) {
        if (req.url.indexOf('/__api__/zip') === 0 && req.method === 'GET') {
            options.req = req;

            zip.archive(options, function(e, data) {
                try {
                    if (e) throw e;
                    stats = fs.lstatSync(data.zipPath); // throws if path doesn't exist
                    if (!stats.isFile()) throw new Error('could not find the app archive');
                }
                catch (err) {
                    res.writeHead(404, { 'content-type': 'text/plain' });
                    res.write('404 Not Found\n');
                    res.end();
                    return;
                }

                res.writeHead(200, { 'content-type': 'application/zip' });
                var stream = fs.createReadStream(data.zipPath);
                stream.on('error', function(e) {
                    console.log(e); // should be improved
                });
                stream.on('close', function() {
                    shell.rm('-rf', data.tmpPath);
                });
                stream.pipe(res);
            });
        }
        else {
            next();
        }
    };
};
