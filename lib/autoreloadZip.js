/*!
 * Module dependencies.
 */
 
var archiver = require('archiver'),
    fs = require('fs'),
    path = require('path')
    findit = require('findit'),
    mkpath = require('mkpath'),
    ncp = require('ncp').ncp;

/**
 * Generates the zips of each of the Cordova versions and platforms
 *
 *
 * Arguments:
 * 
 *
 * Return:
 *
 *
 * Example:
 *
 *
 */
     
module.exports = function(options, files){
    var cordovaPath = path.join(__dirname, '../res/middleware/cordova', version, platform);
    var zipPath = path.join(__dirname, '/../tmp', id);
    var wwwPath = path.join(zipPath, 'www');
    var resPath = path.join(__dirname, '../res/middleware');

    var autoreloadScript = path.join(__dirname, '../res/middleware/autoreload.js'),
        consoleScript = path.join(__dirname, '../res/middleware/consoler.js'),
        homepageScript = path.join(__dirname, '../res/middleware/homepage.js'),
        refreshScript = path.join(__dirname, '../res/middleware/refresh.js');

    var injectScript = function(){
        return fs.readFileSync(autoreloadScript) + fs.readFileSync(consoleScript) + fs.readFileSync(homepageScript) + fs.readFileSync(refreshScript)
    }

    // make our www
    if(!fs.existsSync(wwwPath)){
        mkpath.sync(wwwPath, '0700');
    }

}