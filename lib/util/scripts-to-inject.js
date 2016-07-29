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

        var scriptsToInject;

        if(options.isBrowser) {
            scriptsToInject = '<script type="text/javascript" src="/socket.io/socket.io.js"></script>';
        } else {
            scriptsToInject = '<script type="text/javascript" src="http://' + options.req.headers.host + '/socket.io/socket.io.js"></script>';
        }

        var scripts = [
            { enabled: (options.autoreload && options.isBrowser), src: path.join(__dirname, '../../res/middleware/autoreload-http.js') },    // browser
            { enabled: (options.autoreload && !options.isBrowser), src: path.join(__dirname, '../../res/middleware/autoreload.js') },         // device
            { enabled: (options.console && options.isBrowser), src: path.join(__dirname, '../../res/middleware/consoler-http.js') },      // browser
            { enabled: (options.console && !options.isBrowser), src: path.join(__dirname, '../../res/middleware/consoler.js') },           // device
            { enabled: (options.deploy && !options.isBrowser), src: path.join(__dirname, '../../res/middleware/deploy.js') },             // device
            { enabled: (options.homepage && !options.isBrowser), src: path.join(__dirname, '../../res/middleware/homepage.js') },           // device
            { enabled: (options.proxy && options.isBrowser), src: path.join(__dirname, '../../res/middleware/proxy.js') },              // browser
            { enabled: (options.push), src: path.join(__dirname, '../../res/middleware/push.js') },               // either
            { enabled: (options.refresh && !options.isBrowser), src: path.join(__dirname, '../../res/middleware/refresh.js') }             // device
        ];

        // read each scripts content, skipping those that are disabled
        scripts.forEach(function(script) {
            if (script.enabled) {
              var scriptIn = fs.readFileSync(script.src, 'utf8');

              if(!options.isBrowser) {
                  scriptIn = scriptIn.replace(/\/__api__\/autoreload/, '/__api__/autoreload?appID=' + options.appID);
                  scriptIn = scriptIn.replace(/127\.0\.0\.1:3000/g, options.req.headers.host);
              }

              scriptsToInject += '<script type="text/javascript">' +
                                 scriptIn +
                                 '</script>\n';
            }
        });

        return scriptsToInject;
    }
}
