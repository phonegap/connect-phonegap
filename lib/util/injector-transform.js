/*!
 * Module dependencies.
 */
 
var fs = require('fs'),
    archiver = require('archiver'),
    path = require('path'),
    util = require('util'),
    scripts = require('../util/scripts-to-inject');

/**
 * Util function to help inject scripts using a stream Transform object
 *
 * Options:
 *
 *   - `options` {Object}
 */

module.exports = function(options) {
    options.isBrowser = false;
    var injectScript = scripts.getScripts(options);

    function InjectHTML(options) {
        if (!(this instanceof InjectHTML)) {
            return new InjectHTML(options);
        }

        Transform.call(this, options);
    };

    var Transform = require('stream').Transform;
    util.inherits(InjectHTML, Transform);

    var replaceText = '<script type=\"text/javascript\" src=\"cordova.js\"></script>';
    InjectHTML.prototype._transform = function (chunk, encoding, callback) {
        // Inject our scripts at the bottom of the body tag
        var newChunk = chunk.toString().replace(replaceText, replaceText + injectScript + '\n');

        // Add or update the Content-Security-Policy to allow unsafe-inline scripts
        var cspTag = "<meta http-equiv=\"Content-Security-Policy\" content=\"default-src *; style-src 'self' 'unsafe-inline'; script-src * 'unsafe-inline' 'unsafe-eval'\">";
        var cspRegex = /<meta.+Content-Security-Policy.+>/i;

        if (cspRegex.test(newChunk)) {
            newChunk = newChunk.replace(cspRegex, cspTag);
        }
        else {
            newChunk = newChunk.replace('</head>', cspTag + '\n</head>');
        }

        this.push(newChunk);
        callback();
    };

    return new InjectHTML(options);
};
