/*!
 * Module dependencies.
 */

var fs = require('fs'),
    path = require('path');

/**
 * Utility function to figure out which scripts to inject
 *
 * Options:
 *
 *   - `options` {Object} contains all options available to other middleware.
 */

module.exports = function(options) {

    // pass in browser or just normal phonegap stuff
    
    var scriptsToInject = '<script type="text/javascript" src="/socket.io/socket.io.js"></script>',
        scripts = [
        path.join(__dirname, '../../res/middleware/autoreload-http.js'),    // browser
        path.join(__dirname, '../../res/middleware/consoler-http.js'),      // browser
        path.join(__dirname, '../../res/middleware/autoreload.js'),         // device
        path.join(__dirname, '../../res/middleware/consoler.js'),           // device
        path.join(__dirname, '../../res/middleware/deploy.js'),             // device
        path.join(__dirname, '../../res/middleware/homepage.js'),           // either
        path.join(__dirname, '../../res/middleware/proxy.js'),              // browser
        path.join(__dirname, '../../res/middleware/push.js'),               // either
        path.join(__dirname, '../../res/middleware/refresh.js')             // either
    ];

    // read each scripts content, skipping those that are disabled
    scripts.forEach(function(script) {
        // skip the various scripts if the options for it are turned off
        if (!options.autoreload && !options.isBrowser && script.indexOf('autoreload-http.js') >= 0) {
            return;
        }

        if (!options.autoreload && options.isBrowser && script.indexOf('autoreload.js') >= 0) {
            return;
        }

        if (!options.console && !options.isBrowser && script.indexOf('consoler-http.js') >= 0) {
            return;
        }

        if (!options.console && options.isBrowser && script.indexOf('consoler.js') >= 0) {
            return;
        }

        if (options.isBrowser && script.indexOf('deploy.js') >= 0) {
            return;
        }

        if (!options.homepage && script.indexOf('homepage.js') >= 0) {
            return;
        }

        if (!options.isBrowser && script.indexOf('proxy.js') >= 0) {
            return;
        }
 
        if (!options.push && script.indexOf('push.js') >= 0) {
            return;
        }

        if (!options.refresh && script.indexOf('refresh.js') >= 0) {
            return;
        }

        var scriptIn = fs.readFileSync(script);
        
        if(!options.isBrowser) {
            scriptIn.replace(/\/__api__\/autoreload/, '/__api__/autoreload?appID=' + options.appID);
            scriptIn.replace(/127\.0\.0\.1:3000/g, options.req.headers.host);
        }
        scriptsToInject += '<script type="text/javascript">' +
                           fs.readFileSync(scriptIn) +
                           '</script>\n';
    });

    return scriptsToInject;
};
