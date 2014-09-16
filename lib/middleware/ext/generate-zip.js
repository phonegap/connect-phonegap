/*!
 * Module dependencies.
 */
 
var archiver = require('archiver'),
    fs = require('fs'),
    path = require('path')
    findit = require('findit'),
    mkpath = require('mkpath'),
    ncp = require('ncp').ncp;

/**
 * Generates the zips of each of the Cordova versions and platforms
 *
 *
 * Arguments:
 * 
 *
 * Return:
 *
 *
 * Example:
 *
 *
 */
     
module.exports = function(options, version, platform, id){
    var cordovaPath = path.join(__dirname, '../res/middleware/cordova', version, platform);
    console.log('cordovaPath ' + cordovaPath)
    var zipPath = path.join(__dirname, '/../tmp', id);
    var wwwPath = path.join(zipPath, 'www');
    var resPath = path.join(__dirname, '../res/middleware');

    var autoreloadScript = path.join(__dirname, '../res/middleware/autoreload.js'),
        consoleScript = path.join(__dirname, '../res/middleware/consoler.js'),
        homepageScript = path.join(__dirname, '../res/middleware/homepage.js'),
        refreshScript = path.join(__dirname, '../res/middleware/refresh.js');

    var injectScript = function(){
        return fs.readFileSync(autoreloadScript) + fs.readFileSync(consoleScript) + fs.readFileSync(homepageScript) + fs.readFileSync(refreshScript)
        //return fs.readFileSync(consoleScript) + fs.readFileSync(homepageScript) + fs.readFileSync(refreshScript)
    }

    // make our www
    if(!fs.existsSync(wwwPath)){
        mkpath.sync(wwwPath, '0700');
    }

    // copy over our files first
    ncp(path.join(process.cwd(), 'www'), wwwPath, {filter: '**/*'}, function (err) {
        if (err) {
            //error out
        }

        // find the html files to inject our scripts into
        var finder = findit(wwwPath);
        finder.on('file', function (file, stat) {
            var destPath = path.join(wwwPath, file.split('www')[1]);
            if(file.indexOf('.html') > -1){
                //var relativePath = path.relative(path.dirname(destPath), wwwPath);
                var writer = fs.createWriteStream(destPath, {'flags': 'a'});
                writer.end(injectScript());
            }
        });

        finder.on('end', function(){
            // zip it
            var output = fs.createWriteStream(zipPath + '/app.zip');
            var archive = archiver('zip');

            output.on('close', function () {
                options.emitter.emit('log', 'archived ' + version + ' ' + platform + ' www/: ' + archive.pointer(), 'total bytes');
            });

            archive.on('error', function(err){
                options.emitter.emit('log', 'error', err);
            });

            archive.pipe(output);

            archive.bulk([
                { expand: true, cwd: wwwPath, src: ['**/*'] },
                { expand: true, cwd: cordovaPath, src: ['*.js', 'plugins/**/*'] },
                { expand: true, cwd: resPath, src: ['!proxy.js', '*.js'] }
            ]);

            archive.finalize();
        });
    });
}