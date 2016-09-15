/*!
 * Module dependencies.
 */
 
var fs = require('fs'),
    archiver = require('archiver'),
    path = require('path'),
    util = require('util'),
    cspParser = require('../util/csp-parser'),
    cspBuilder = require('../util/csp-builder'),
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
        var cspRegex = /<meta.+Content-Security-Policy.+content.+"(.+)".*>/i;
        var cspObject, cspString, cspTag;

        // if we find an existing csp - warn the user about their csp being modified
        // this is a little weird to parse the exact portion of the meta head that we need
        var result = cspRegex.exec(newChunk);

        if(result != null && result.length>=2) {
            cspObject = cspParser(result[1]);
            cspString = cspBuilder(cspObject);
            cspTag = '<meta http-equiv="Content-Security-Policy" content="' + cspString + '">';
            newChunk = newChunk.replace(cspRegex, cspTag);

            if(options.emitter) {
                options.emitter.emit('log', '[console.warn]'.yellow + ' Content Security Policy has been modified to be:', cspTag);
            }
        } else if(result == null){
            cspObject = {};
            cspString = cspBuilder(cspObject);
            cspTag = '<meta http-equiv="Content-Security-Policy" content="' + cspString + '">';
            newChunk = newChunk.replace('</head>', cspTag + '\n</head>');

            if(options.emitter) {
                options.emitter.emit('log', '[console.warn]'.yellow + ' Content Security Policy has been added:', cspTag);
            }
        }

        this.push(newChunk);
        callback();
    };

    return new InjectHTML(options);
};
