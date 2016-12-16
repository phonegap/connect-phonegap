/*!
 * Module dependencies.
 */

var fs = require('fs'),
    archiver = require('archiver'),
    path = require('path'),
    walk = require('walkdir'),
    util = require('util'),
    scripts = require('../util/scripts-to-inject'),
    Injector = require('../util/injector-transform');

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
        if (req.url.indexOf('/__api__/appzip') === 0) {
            // ios wants to ping the appzip end route with a HEAD request,
            // so send back a 200 to let it know that this url is valid
            if (req.method === 'HEAD') {
                res.writeHead(200, { 'Content-Type': 'text/plain' });
                res.end();
            } else if(req.method === 'GET') {
                options.req = req;

                var archive = archiver('zip', { store: false });

                archive.on('error', function(err) {
                    console.error('Error, could not complete to zip up the app:');
                    console.error(err.stack);
                    res.end();
                });

                res.writeHead(200, { 'Content-Type': 'application/zip' } );
                archive.pipe(res);

                // Real paths mapped to their canonical symlinked path, if they have one.
                var realToSym = {};

                // Returns path containing canonical symlinks (if any).
                function pathWithSymlinks(path) {
                    var withSymlinks = path;
                    for (var real in realToSym) {
                        if (withSymlinks.indexOf(real) === 0) {
                            var symlink = realToSym[real];
                            withSymlinks = withSymlinks.replace(real, symlink);
                        }
                    }
                    return withSymlinks;
                };

                var theWalker = walk(path.join(process.cwd(), 'www'), {'follow_symlinks': true});

                theWalker.on('link', function(linked) {
                    var realPath = fs.realpathSync(linked);
                    realToSym[realPath] = pathWithSymlinks(linked);
                });

                theWalker.on('file', function(filename) {
                    var output = pathWithSymlinks(filename).split(process.cwd())[1];

                    if (path.extname(filename) === '.html') {
                        var htmlStreamFile = fs.createReadStream(filename);
                        var injectorTransform = new Injector(options);
                        htmlStreamFile.pipe(injectorTransform);
                        archive.append(injectorTransform, { name: output });
                    }
                    else {
                        archive.append(fs.createReadStream(filename), { name: output });
                    }
                });

                theWalker.on('end', function() {
                    archive.finalize();
                });
            }
        }
        else {
            next();
        }
    };
};
