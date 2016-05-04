/*!
 * Module dependencies.
 */
 
var fs = require('fs'),
    archiver = require('archiver'),
    path = require('path'),
    util = require('util');

/**
 *
 */
module.exports = function(options) {
    options.req = req;

    var resPath = path.join(__dirname, '../../res/middleware');
    var pathForResource = function(resourceFileName) {
        return path.join(resPath, resourceFileName);    
    }
    
    var injectScript = function() {
        var scriptSrc = '<script type="text/javascript" src="http://127.0.0.1:3000/socket.io/socket.io.js"></script>';
        // const array of js files to concat
        ['deploy.js','autoreload.js','consoler.js','homepage.js','push.js','refresh.js']
        .forEach(function(scriptName){
            scriptSrc += '<script type="text/javascript">' + 
                         fs.readFileSync(pathForResource(scriptName)) +
                         '</script>\n';
                
        });
        return scriptSrc.replace(/127\.0\.0\.1:3000/g, options.req.headers.host);
    }

    var Transform = require('stream').Transform;
    util.inherits(InjectHTML, Transform);

    function InjectHTML(options) {
        if (!(this instanceof InjectHTML)) {
            return new InjectHTML(options);
        }

        Transform.call(this, options);
    };

    var replaceText = '<script type=\"text/javascript\" src=\"cordova.js\"></script>';
    InjectHTML.prototype._transform = function (chunk, encoding, callback) {
        var newChunk = chunk.toString().replace(replaceText, replaceText + injectScript() + '\n');
        this.push(newChunk);
        callback();
    };
};
