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

function getPathPrefix(options, req)
{
    // Allow override of platform physical path for cordova JS files
    // options.www_ios, options.www_android, options.www_wp8 ... etc 
    return options['www_' + req.session.device.platform] || 
        path.join(__dirname,
                  '../../res/middleware/cordova',
                  req.session.device.version, 
                  req.session.device.platform);
}

function sendFile(res, filepath)
{
    res.staticpath = filepath;
    var data = fs.readFileSync(filepath);
    res.writeHead(200, { 'Content-Type': 'text/javascript' });
    res.end(data);    
}

module.exports = function(options) {
    return function(req, res, next) {        
        var prefix = getPathPrefix(options, req);
        
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
