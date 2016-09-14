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
        var cspRegex = /<meta.+Content-Security-Policy.+content.+"(.+)".+\/>/i;

        // if we find an existing csp - warn the user about their csp being modified
        // this is a little weird to parse the exact portion of the meta head that we need
        var result = cspRegex.exec(newChunk);
        if(result != null && result.length>=2) {
            var cspObject = cspParser(result[1]);
            var cspString = cspBuilder(cspObject);
            var cspTag = '<meta http-equiv="Content-Security-Policy" content="' + cspString + '">';
            newChunk = newChunk.replace(cspRegex, cspTag);

            options.emitter.emit('log', '[console.warn]'.yellow + 'Content Security Policy has been modified to be:', cspTag);
        }


        this.push(newChunk);
        callback();
    };

    return new InjectHTML(options);
};
