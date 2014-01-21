/*!
 * Module dependencies.
 */

/**
 * Middlware to handle live reload 
 *
 * Serves updated content from the www/
 */

module.exports = function(appState) {
    return function(req, res, next) {
        if (req.url.indexOf('cordova_live_reload') >= 0) {
            res.writeHead(200, {'Content-Type' : 'text/json'});
            res.end(JSON.stringify({reload : appState.reload}));
            appState.reload = false;
            console.log('Reload requested'); 
        } else {
            next();
        }
    };
};
