/*!
 * Module dependencies.
 */

var fs = require('fs'),
    inject = require('connect-inject'),
    path = require('path');

/**
 * Middleware to inject JavaScript into the served app.
 */

module.exports = function() {
    var autoreloadScript = path.join(__dirname, '../../res/middleware/autoreload.js'),
        consoleScript = path.join(__dirname, '../../res/middleware/consoler.js'),
        homepageScript = path.join(__dirname, '../../res/middleware/homepage.js'),
        proxyScript = path.join(__dirname, '../../res/middleware/proxy.js'),
        refreshScript = path.join(__dirname, '../../res/middleware/refresh.js');

    return inject({
        snippet: [
            fs.readFileSync(autoreloadScript),
            fs.readFileSync(consoleScript),
            fs.readFileSync(homepageScript),
            fs.readFileSync(proxyScript),
            fs.readFileSync(refreshScript)
        ]
    });
};
