var path = require('path'),
    fs = require('fs'),
    EventEmitter = require('events').EventEmitter,
    Q = require('q'),
    cordovaDependency = require('phonegap-cordova-dependence');

var cordovaSaved;

/**
 * Requires Cordova from the dependency path within a project. 
 * MUST BE CALLED FROM WITHIN A PROJECT TO SUCEED.
 * @param  {EventEmitter} extEventsEmitter optional; otherwise logs to console.log and console.error
 * @return {promise} 	the result of calling require('cordova') or false if not possible to;
 */
module.exports.getCordova = function (extEventsEmitter){
	extEventsEmitter = extEventsEmitter || ConsoleEmitter();
	if (cordovaSaved) {
        return Q(cordovaSaved);
    } 
    return cordovaDependency.exec(undefined, extEventsEmitter)
        .then(function(projectPath){
            var nodeModules = path.join(projectPath, 'node_modules');
            var cordovaPath = path.join(path.join(nodeModules, 'cordova'));
            if (!fs.existsSync(nodeModules)) {
                cordovaSaved = undefined;
                e = new Error('node_modules not found; need to run npm install');
                extEventsEmitter.emit('error', e.message);
                throw e;
            } else if (!fs.existsSync(cordovaPath)) {
                cordovaSaved = undefined;
                e = new Error('Cordova not found in project; run "npm install cordova"');
                extEventsEmitter.emit('error', e.message);
                throw e;
            } else {
                var cordova = require(cordovaPath);
                cordovaSaved = cordova;
                return cordova;
            }
        });
}

function ConsoleEmitter() {
	var emitter = new EventEmitter();
	emitter.on('log', function(msg){
		console.log('[LOG]: '+ msg);
	})
	emitter.on('warn', function(msg){
		console.log('[WARN]: '+ msg);
	})
	emitter.on('verbose', function(msg){
		console.log('[VERBOSE]: '+ msg);
	})
	emitter.on('error', function(msg){
		console.error(msg);
	});
	return emitter;
}
