/*!
 * Module dependencies.
 */

var injectScripts = require('../../lib/util/scripts-to-inject'),
    fs = require('fs'),
    path = require('path');

/*!
 * Specification.
 */

describe('scripts to inject', function() {
    var options, scriptIn, fsSpy;
    var scripts = {
        autoreload: path.join(__dirname, '../../res/middleware/autoreload.js'),
        autoreloadHttp: path.join(__dirname, '../../res/middleware/autoreload-http.js'),
        console: path.join(__dirname, '../../res/middleware/consoler.js'),
        consoleHttp: path.join(__dirname, '../../res/middleware/consoler-http.js'),
        deploy: path.join(__dirname, '../../res/middleware/deploy.js'),
        homepage: path.join(__dirname, '../../res/middleware/homepage.js'),
        proxy: path.join(__dirname, '../../res/middleware/proxy.js'),
        push: path.join(__dirname, '../../res/middleware/push.js'),
        refresh: path.join(__dirname, '../../res/middleware/refresh.js')
    }
 
    describe('.getScripts(options)', function() {
        beforeEach(function() {
            fsSpy = spyOn(fs, 'readFileSync').andCallThrough();

            options = {
                appID: '1234',
                autoreload: false,
                console: false,
                deploy: false,
                homepage: false,
                isBrowser: false,
                proxy: false,
                push: false,
                refresh: false,
                req: {
                    headers: {
                        host: '127.0.0.1'
                    }
                }
            };
        });

        it('should be a function', function () {
            expect(injectScripts.getScripts).toEqual(jasmine.any(Function));
        });
        
        it('should return browser specific scripts when enabled', function() {
            options.autoreload = true;
            options.isBrowser = true;
            expect(injectScripts.getScripts(options)).toMatch('/socket.io/socket.io.js');
            expect(injectScripts.getScripts(options)).not.toMatch(options.req.headers.host);
        });

        it('should return developer app specific scripts when enabled', function() {
            options.autoreload = true;
            options.isBrowser = false;
            expect(injectScripts.getScripts(options)).toMatch(options.appID); 
            expect(injectScripts.getScripts(options)).toMatch(options.req.headers.host);            
        });

        it('should return autoreload when enabled', function() {
            options.autoreload = true;
            options.isBrowser = false;
            injectScripts.getScripts(options);
            expect(fsSpy).toHaveBeenCalledWith(scripts.autoreload, 'utf8');

        });

        it('should return autoreload http when enabled', function() {
            options.autoreload = true;
            options.isBrowser = true;
            injectScripts.getScripts(options);
            expect(fsSpy).toHaveBeenCalledWith(scripts.autoreloadHttp, 'utf8');           
        });

        it('should return console when enabled', function() {
            options.console = true;
            options.isBrowser = false;
            injectScripts.getScripts(options);
            expect(fsSpy).toHaveBeenCalledWith(scripts.console, 'utf8'); 
        });

        it('should return console http when enabled', function() {
            options.console = true;
            options.isBrowser = true;
            injectScripts.getScripts(options);
            expect(fsSpy).toHaveBeenCalledWith(scripts.consoleHttp, 'utf8'); 
        });

        it('should return deploy when enabled', function() {
            options.deploy = true;
            options.isBrowser = false;
            injectScripts.getScripts(options);
            expect(fsSpy).toHaveBeenCalledWith(scripts.deploy, 'utf8'); 
        });

        it('should return homepage when enabled', function() {
            options.homepage = true;
            injectScripts.getScripts(options);
            expect(fsSpy).toHaveBeenCalledWith(scripts.homepage, 'utf8'); 
        });

        it('should return proxy when enabled', function() {
            options.proxy = true;
            options.isBrowser = true;
            injectScripts.getScripts(options);
            expect(fsSpy).toHaveBeenCalledWith(scripts.proxy, 'utf8'); 
        });

        it('should return push when enabled', function() {
            options.push = true;
            injectScripts.getScripts(options);
            expect(fsSpy).toHaveBeenCalledWith(scripts.push, 'utf8'); 
        });

        it('should return refresh when enabled', function() {
            options.refresh = true;
            injectScripts.getScripts(options);
            expect(fsSpy).toHaveBeenCalledWith(scripts.refresh, 'utf8'); 
        });

    });
});
