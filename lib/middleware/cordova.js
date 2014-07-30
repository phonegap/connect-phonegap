/*!
 * Module dependencies.
 */

var fs = require('fs'),
    path = require('path');

/**
 * cordova.js middleware.
 *
 * Serves cordova.js, phonegap.js, cordova_plugins.js or plugins/*
 *
 * Install this middleware after the static middleware to allow bundled files to served first.
 */

function getVDirMapping(vdir, device)
{
    // Virtual directory mapping for cordova JS files
    //   options.vdir.www                    - Maps static files.
    //   options.vdir.<platform>[.<version>] - Maps platform files
    // Examples:
    //   options.vdir.android = 'platforms/android/assets/www';
    //   options.vdir.android.3_5_0 = 'test/android/3.5.0';
    var vplatform = vdir[device.platform];
    var version = 'v' + device.version.replace(/\./g, '_');
    return (typeof vplatform === "object") ? vplatform[version] : vplatform;
}
 
function sendFile(res, next, filepath)
{
    res.staticpath = filepath;  // record the physical path for logging
    if (fs.existsSync(filepath)) {
        var data = fs.readFileSync(filepath);
        res.writeHead(200, { 'Content-Type': 'text/javascript' });
        res.end(data);
    } else {
        res.writeHead(404, { 'Content-Type': 'text/text' });
        res.end(filepath + ': File not found');
    }
}

module.exports = function(options) {
    return function(req, res, next) {
        if (!req.session.prefix) {
            var device = req.session.device;
            req.session.prefix = (options.vdir && getVDirMapping(options.vdir, device))
                || path.join(__dirname, '../../res/middleware/cordova', device.version, device.platform);
        }
        
        var prefix = req.session.prefix;

        if (req.url.indexOf('cordova.js') >= 0 || req.url.indexOf('phonegap.js') >= 0) {
            sendFile(res, next, path.join(prefix, 'cordova.js'));
        } else if (req.url.indexOf('cordova_plugins.js') >= 0) {
            sendFile(res, next, path.join(prefix, 'cordova_plugins.js'));
        } else if (req.url.indexOf('plugins/') >= 0) {
            var pluginPath = req.url.split('plugins/')[1];
            sendFile(res, next, path.join(prefix, 'plugins', pluginPath));
        } else {
            next();
        }
    };
};
