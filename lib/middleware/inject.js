/*!
 * Module dependencies.
 */

var inject = require('connect-inject'),
    path = require('path'),
    fs = require('fs');

/**
 * Inject JavaScript into served app middleware.
 *
 * Inject JavaScript to navigate to the homepage of the PhoneGap App.
 * Inject JavaScript to navigate to refresh the served app.
 */

module.exports = function() {
    var homepageScript = path.join(__dirname, '../../res/middleware/homepage.js'),
        refreshScript = path.join(__dirname, '../../res/middleware/refresh.js');

    return inject({
        snippet: [
            fs.readFileSync(homepageScript),
            fs.readFileSync(refreshScript)
        ]
    });
};
