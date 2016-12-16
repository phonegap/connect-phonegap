/*!
 * Module dependencies.
 */

var fs = require('fs'),
    archiver = require('archiver'),
    path = require('path'),
    util = require('util'),
    scripts = require('../util/scripts-to-inject'),
    Injector = require('../util/injector-transform');

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
            options.req = req;

            var archive = archiver('zip', { store: false });

            archive.on('error', function(err) {
                console.error('Error, could not complete to zip up the app:');
                console.error(err.stack);
                res.end();
            });

            res.writeHead(200, { 'Content-Type': 'application/zip' } );
            archive.pipe(res);

            if(!req.session.lastFlush) {
                req.session.lastFlush = 0;
            }

            // first find where the indices we need to update in options.filesToUpdate
            var lastUpdatedIndex = 0;
            for (var i = 0; i < options.filesToUpdate.length; i++) {
                if (req.session.lastFlush < options.filesToUpdate[i][0]) {
                    lastUpdatedIndex = i;
                }
            }

            for (var i = lastUpdatedIndex; i < options.filesToUpdate.length; i++) {
                var filename = options.filesToUpdate[i][1];
                var output = filename.split(process.cwd())[1];

                if (path.extname(filename) === '.html') {
                    var htmlStreamFile = fs.createReadStream(filename);
                    var injectorTransform = new Injector(options);
                    htmlStreamFile.pipe(injectorTransform);

                    archive.append(injectorTransform, { name: output });
                }
                else {
                    archive.append(fs.createReadStream(filename), { name: output });
                }
            }

            req.session.lastFlush = Date.now();

            archive.finalize();
        }
        else {
            next();
        }
    };
};
