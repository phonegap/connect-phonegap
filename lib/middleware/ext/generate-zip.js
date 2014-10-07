/*!
 * Module dependencies.
 */
 
var archiver = require('archiver'),
    fs = require('fs'),
    path = require('path'),
    findit = require('findit'),
    ncp = require('ncp').ncp,
    shell = require('shelljs'),
    os = require('os');

/**
 * Handle the /zip route
 *
 * Generates a zip archive of the served application, which is deployed
 * on the device.
 *
 * Options:
 *   - `options.req` is the request object provided by `http`
 *   - `options.emitter` is an event emitter to broadcast progress
 */

module.exports.archive = function(options, callback) {
    // required options
    if (!options.req) throw new Error('requires options.req');
    if (!options.emitter) throw new Error('requires options.emitter');

    // source path to the user's app
    var source = {};
    source.appPath = path.join(process.cwd());
    source.wwwPath = path.join(source.appPath, 'www');

    // source path must be a cordova directory
    if (!fs.existsSync(source.wwwPath)) {
        return callback(new Error('could not find www/'));
    }

    // destination path to the temp directory and app archive
    var destination = {};
    destination.tmpPath = path.join(os.tmpdir(), 'connect-phonegap', options.req.sessionID);
    destination.wwwPath = path.join(destination.tmpPath, 'www');
    destination.zipPath = path.join(destination.tmpPath, 'www.zip');

    // create the temporary directory
    if (!fs.existsSync(destination.wwwPath)) {
        shell.mkdir('-p', destination.wwwPath);
    }

    // copy the app to our temporary temporary path
    ncp(source.wwwPath, destination.wwwPath, { filter: '**/*' }, function (e) {
        if (e) {
            return callback(e);
        }

        // find the html files to inject our scripts into
        var finder = findit(destination.wwwPath);
        finder.on('file', function (file, stat) {
            var destPath = path.join(destination.wwwPath, file.split('www')[1]);
            if (file.indexOf('.html') > -1) {
                var writer = fs.createWriteStream(destPath, { 'flags': 'a' });
                writer.end(injectScript());
            }
        });

        // after modifying the html files, we will create a zip archive of the app
        finder.on('end', function(){
            var archive = archiver('zip'),
                output = fs.createWriteStream(destination.zipPath);

            // finished creating zip
            output.on('close', function () {
                options.emitter.emit('log', 'created app archive (' + archive.pointer(), 'bytes)');
                callback(null, destination);
            });

            // error creating zip
            archive.on('error', function(e) {
                options.emitter.emit('error', e);
                callback(e);
            });

            // create the zip
            archive.pipe(output);
            archive.bulk([
                { expand: true, cwd: destination.wwwPath, src: ['**/*'] }
            ]);
            archive.finalize();
        });

        // helper function that returns the scripts to inject into each HTML page
        function injectScript() {
            var sourcePath = path.join(__dirname, '../../../res/middleware'),
                autoreloadScript = path.join(sourcePath, 'autoreload.js'),
                consoleScript = path.join(sourcePath, 'consoler.js'),
                homepageScript = path.join(sourcePath, 'homepage.js'),
                refreshScript = path.join(sourcePath, 'refresh.js');

            var scripts = fs.readFileSync(autoreloadScript) +
                          fs.readFileSync(consoleScript) +
                          fs.readFileSync(homepageScript) +
                          fs.readFileSync(refreshScript);

            // replace default server address with this server address
            return scripts.replace(/127\.0\.0\.1:3000/g, options.req.headers.host);
        }
    });
};
