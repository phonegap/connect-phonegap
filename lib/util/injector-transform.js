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
        var scriptSrc = "";
        ['deploy.js','autoreload.js','consoler.js','homepage.js','push.js','refresh.js']
        .forEach(function(scriptName){
            scriptSrc += fs.readFileSync(pathForResource(scriptName));
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

    InjectHTML.prototype._transform = function (chunk, encoding, callback) {
        var newChunk = chunk.toString().replace('<script type=\"text/javascript\" src=\"cordova.js\"></script>', '<script type=\"text/javascript\" src=\"cordova.js\"></script>' + injectScript() + '\n');
        this.push(newChunk);
        callback();
    };
};
