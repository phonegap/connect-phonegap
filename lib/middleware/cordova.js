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
    if (!vdir) return false;
    // Virtual directory mapping for cordova JS files
    //   options.vdir.www                    - Maps static files.
    //   options.vdir.<platform>[.<version>] - Maps platform files
    // Examples:
    //   options.vdir.android = 'platforms/android/assets/www';
    //   options.vdir.android.3_5_0 = 'test/android/3.5.0';
    var vplatform = vdir[device.platform];
    return (typeof vplatform === "object") ? vplatform[device.version.replace(/\./g, '_')] : vplatform;
}
 
function sendFile(res, filepath)
{
    res.staticpath = filepath;  // record the physical path for logging
    if (!fs.existsSync(filepath)) {
        res.status(404).send('Not found');
        return;
    } else {
        var data = fs.readFileSync(filepath);
        res.writeHead(200, { 'Content-Type': 'text/javascript' });
        res.end(data);
    }
}

module.exports = function(options) {
    return function(req, res, next) {
        if (!res.session.prefix) {
            res.session.prefix = getVDirMapping(options.vdir, req.session.device) 
                         || path.join(__dirname,
                      '../../res/middleware/cordova',
                      req.session.device.version, 
                      req.session.device.platform);
        }
        var prefix = res.session.prefix;
        
        if (req.url.indexOf('cordova.js') >= 0 || req.url.indexOf('phonegap.js') >= 0) {
            sendFile(res, path.join(prefix, 'cordova.js'));
        } else if (req.url.indexOf('cordova_plugins.js') >= 0) {
            sendFile(res, path.join(prefix, 'cordova_plugins.js'));
        } else if (req.url.indexOf('plugins/') >= 0) {
            var pluginPath = req.url.split('plugins/')[1];
            sendFile(res, path.join(prefix, 'plugins', pluginPath));
        } else {
            next();
        }
    };
};
