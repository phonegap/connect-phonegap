/*!
 * Module dependencies.
 */

var fs = require('fs'),
    inject = require('connect-inject'),
    path = require('path');

/**
 * Middlware to inject JavaScript into the served app.
 *
 * - injects JavaScript to navigate to the homepage of the PhoneGap App.
 * - injects JavaScript to refresh the served app.
 */

module.exports = function() {
    var hammerJs = path.join(__dirname, '../../res/middleware/hammer/hammer.js'),
        homepageScript = path.join(__dirname, '../../res/middleware/homepage.js'),
        refreshScript = path.join(__dirname, '../../res/middleware/refresh.js'),
        autoreloadScript = path.join(__dirname, '../../res/middleware/autoreload.js');

    return inject({
        snippet: [
            //fs.readFileSync(hammerJs),
            fs.readFileSync(homepageScript),
            fs.readFileSync(refreshScript),
            fs.readFileSync(autoreloadScript)
        ]
    });
};
