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

module.exports = {
    getScripts: function(options) {
        options.isBrowser = options.isBrowser || false;
        console.log(options);
        var scriptsToInject;

        if(options.isBrowser) {
            scriptsToInject = '<script type="text/javascript" src="/socket.io/socket.io.js"></script>';
        } else {
            scriptsToInject = '<script type="text/javascript" src="http://127.0.0.1:3000/socket.io/socket.io.js"></script>';
        }

        var scripts = [
            path.join(__dirname, '../../res/middleware/autoreload-http.js'),    // browser
            path.join(__dirname, '../../res/middleware/autoreload.js'),         // device
            path.join(__dirname, '../../res/middleware/consoler-http.js'),      // browser
            path.join(__dirname, '../../res/middleware/consoler.js'),           // device
            path.join(__dirname, '../../res/middleware/deploy.js'),             // device
            path.join(__dirname, '../../res/middleware/homepage.js'),           // either
            path.join(__dirname, '../../res/middleware/proxy.js'),              // browser
            path.join(__dirname, '../../res/middleware/push.js'),               // either
            path.join(__dirname, '../../res/middleware/refresh.js')             // either
        ];

        // read each scripts content, skipping those that are disabled
        scripts.forEach(function(script) {
            // this is really annoying to figure out the scenarios in which to inject scripts
            // since we have to further determine if it's a browser or dev app connecting
            // to serve the proper files

            if (!options.autoreload && script.indexOf('autoreload-http.js') >= 0) {
                return;
            }

            if (options.autoreload && !options.isBrowser && script.indexOf('autoreload-http.js') >= 0) {
                return;
            }

            if (!options.autoreload && script.indexOf('autoreload.js') >= 0) {
                return;
            }

            if (options.autoreload && options.isBrowser && script.indexOf('autoreload.js') >= 0) {
                return;
            }

            if (!options.console && script.indexOf('consoler-http.js') >= 0) {
                return;
            }

            if (options.console && !options.isBrowser && script.indexOf('consoler-http.js') >= 0) {
                return;
            }

            if (!options.console && script.indexOf('consoler.js') >= 0) {
                return;
            }

            if (options.console && options.isBrowser && script.indexOf('consoler.js') >= 0) {
                return;
            }

            if (options.isBrowser && script.indexOf('deploy.js') >= 0) {
                return;
            }

            if (!options.homepage && script.indexOf('homepage.js') >= 0) {
                return;
            }

            if (!options.proxy && script.indexOf('proxy.js') >= 0) {
                return;
            }

            if (options.proxy && !options.isBrowser && script.indexOf('proxy.js') >= 0) {
                return;
            }

            if (!options.push && script.indexOf('push.js') >= 0) {
                return;
            }

            if (!options.refresh && script.indexOf('refresh.js') >= 0) {
                return;
            }

            var scriptIn = fs.readFileSync(script, 'utf8');

            if(!options.isBrowser) {
                scriptIn = scriptIn.replace(/\/__api__\/autoreload/, '/__api__/autoreload?appID=' + options.appID);
                scriptsToInject = scriptsToInject.replace(/127\.0\.0\.1:3000/g, options.req.headers.host);
            }

            scriptsToInject += '<script type="text/javascript">' +
                               scriptIn +
                               '</script>\n';
        });
        console.log(scriptsToInject)
        return scriptsToInject;
    }
}
