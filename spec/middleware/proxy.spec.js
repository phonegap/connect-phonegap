/*!
 * Module dependencies.
 */

var chdir = require('chdir'),
    gaze = require('gaze'),
    phonegap = require('../../lib'),
    request = require('supertest'),
    rewire = require('rewire'),
    middleware = rewire('../../lib/middleware/proxy'),
    proxy, revert, web_spy, emit_spy, req;

/*!
 * Specification: Proxy middleware.
 */

describe('proxy middleware', function() {
    describe('single-origin request', function() {
        beforeEach(function() {
            spyOn(gaze, 'Gaze').and.returnValue({ on: function() {} });
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
            revert = middleware.__set__('proxy', {
                once:function() {},
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
});
