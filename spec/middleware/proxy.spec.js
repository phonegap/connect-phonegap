/*!
 * Module dependencies.
 */

var chdir = require('chdir'),
    chokidar = require('chokidar'),
    phonegap = require('../../lib'),
    request = require('supertest'),
    rewire = require('rewire'),
    http = require('http'),
    middleware = rewire('../../lib/middleware/proxy'),
    proxy, revert, web_spy, emit_spy, once_spy, req,
    test_server;

/*!
 * Specification: Proxy middleware.
 */

describe('proxy middleware', function() {
    describe('single-origin request', function() {
        beforeEach(function() {
            spyOn(chokidar, 'watch').and.returnValue({ on: function() {} });
        });
        it('should be served normally', function(done) {
            chdir('spec/fixture/app-with-cordova', function() {
                request(phonegap())
                .get('/cordova.js')
                .end(function(e, res) {
                    expect(res.statusCode).toEqual(200);
                    expect(res.text).toMatch('i am cordova');
                    done();
                });
            });
        });
    });

    describe('cross-origin request', function() {
        beforeEach(function() {
            web_spy = jasmine.createSpy('proxy.web spy');
            emit_spy = jasmine.createSpy('emitter spy');
            once_spy = jasmine.createSpy('proxy.once spy');
            revert = middleware.__set__('proxy', {
                once: once_spy,
                web: web_spy
            });
            req = {
                url: '/proxy/' + encodeURIComponent('http://phonegap.com/'),
                headers: {
                    host: '192.168.0.1'
                }
            };
            proxy = middleware({
                emitter: {
                    emit: emit_spy
                }
            });
        });
        afterEach(function() {
            revert();
        });
        it('should proxy http:', function() {
            req.url = '/proxy/' + encodeURIComponent('http://phonegap.com/');
            var res = {};
            proxy(req, res);
            expect(web_spy).toHaveBeenCalledWith(req, res, {target: 'http://phonegap.com'}, jasmine.any(Function));
        });
        it('should proxy https:', function() {
            req.url = '/proxy/' + encodeURIComponent('https://phonegap.com/');
            var res = {};
            proxy(req, res);
            expect(web_spy).toHaveBeenCalledWith(req, res, {target: 'https://phonegap.com'}, jasmine.any(Function));
        });
        it('should emit an error and return HTTP 500 for an invalid URL', function() {
            // Revert rewire bits done in beforeEach
            revert();
            // Set up our own proxy.web spy so we can trigger the error flow
            var err_msg = 'http://filmaj is an invalid url';
            revert = middleware.__set__('proxy', {
                once:function() {},
                web: function(req, res, opts, cb) {
                    cb({
                        message: err_msg,
                        code: 'ENOTFOUND'
                    }, req, res);
                }
            });
            req.url = '/proxy/' + encodeURIComponent('http://filmaj/');
            var res = {
                writeHead: jasmine.createSpy('res.writeHead'),
                end: jasmine.createSpy('res.end')
            };
            proxy(req, res);
            expect(emit_spy).toHaveBeenCalledWith('error', 'Proxy error for url: http://filmaj/', err_msg);
            expect(res.writeHead).toHaveBeenCalledWith(500);
            expect(res.end).toHaveBeenCalledWith(err_msg);
        });
    });
    describe('integration test with a separate server', function() {
        beforeEach(function() {
            spyOn(chokidar, 'watch').and.returnValue({ on: function() {} });
        });
        afterEach(function() {
            test_server.close();
        });
        it('should handle redirects to different paths on the same server appropriately', function(done) {
            test_server = http.createServer(function (req, res) {
                if (req.url.match(/redirect/)) {
                    res.writeHead(302, {
                        'Location': '/gohereplz'
                    });
                } else {
                    res.writeHead(200, { 'Content-Type': 'text/plain' });
                    res.write('you have arrived');
                }
                res.end();
            }).listen(9000);
            chdir('spec/fixture/app-with-cordova', function() {
                request(phonegap())
                .get('/proxy/' + encodeURIComponent("http://localhost:9000/redirect"))
                .end(function(e, res) {
                    expect(res.statusCode).toEqual(302);
                    expect(res.headers.location).toContain('/proxy/' + encodeURIComponent('http://localhost:9000/gohereplz'));
                    done();
                });
            });
        });
        it('should handle redirects to different domains appropriately', function(done) {
            test_server = http.createServer(function (req, res) {
                res.writeHead(302, {
                    'Location': 'http://phonegap.com/robots.txt'
                });
                res.end();
            }).listen(9000);
            chdir('spec/fixture/app-with-cordova', function() {
                request(phonegap())
                .get('/proxy/' + encodeURIComponent("http://localhost:9000/redirect"))
                .end(function(e, res) {
                    expect(res.statusCode).toEqual(302);
                    expect(res.headers.location).toContain('/proxy/' + encodeURIComponent('http://phonegap.com/robots.txt'));
                    done();
                });
            });
        });
    });
});
