/*!
 * Module dependencies.
 */
 
var archiver = require('archiver'),
    fs = require('fs'),
    path = require('path'),
    findit = require('findit'),
    mkpath = require('mkpath'),
    ncp = require('ncp').ncp;

/**
 * Handle the /zip route
 *
 * Generates a zip archive of the served application, which is deployed
 * on the device.
 *
 * Options:
 *   - `options.req` is the request object provided by `http`
 */

module.exports = function(options, callback) {
    var resPath = path.join(__dirname, '../../../res/middleware'),
        zipPath = path.join(__dirname, '../../../tmp', options.req.sessionID),
        wwwPath = path.join(zipPath, 'www');

    // helper function that returns the scripts to inject into each HTML page
    var injectScript = function() {
        var autoreloadScript = path.join(resPath, 'autoreload.js'),
            consoleScript = path.join(resPath, 'consoler.js'),
            homepageScript = path.join(resPath, 'homepage.js'),
            refreshScript = path.join(resPath, 'refresh.js');

        var scripts = fs.readFileSync(autoreloadScript) +
                      fs.readFileSync(consoleScript) +
                      fs.readFileSync(homepageScript) +
                      fs.readFileSync(refreshScript);

        // replace default server address with this server address
        return scripts.replace(/127\.0\.0\.1:3000/g, options.req.headers.host);
    };

    // create the temporary www/
    if (!fs.existsSync(wwwPath)) {
        mkpath.sync(wwwPath, '0700');
    }

    // copy the app to our temporary temporary path
    ncp(path.join(process.cwd(), 'www'), wwwPath, { filter: '**/*' }, function (e) {
        if (e) {
            return callback(e);
        }

        // find the html files to inject our scripts into
        var finder = findit(wwwPath);
        finder.on('file', function (file, stat) {
            var destPath = path.join(wwwPath, file.split('www')[1]);
            if (file.indexOf('.html') > -1) {
                var writer = fs.createWriteStream(destPath, { 'flags': 'a' });
                writer.end(injectScript());
            }
        });

        // after modifying the html files, we will create a zip archive of the app
        finder.on('end', function(){
            var outputPath = path.join(zipPath, 'app.zip');
            var output = fs.createWriteStream(outputPath);
            var archive = archiver('zip');

            // finished creating zip
            output.on('close', function () {
                options.emitter.emit('log', 'created app archive (' + archive.pointer(), 'bytes)');
                callback(null, { zipPath: outputPath });
            });

            // error creating zip
            archive.on('error', function(e) {
                options.emitter.emit('error', e);
                callback(e);
            });

            // create the zip
            archive.pipe(output);
            archive.bulk([
                { expand: true, cwd: wwwPath, src: ['**/*'] }
            ]);
            archive.finalize();
        });
    });
};
