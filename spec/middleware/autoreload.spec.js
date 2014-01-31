/*!
 * Module dependencies.
 */

var middleware = require('../../lib/middleware'),
    gaze = require('gaze'),
    events = require('events'),
    http = require('http'),
    request = require('supertest'),
    soundwave = require('../../lib'),
    chdir = require('chdir'),
    options,
    watchSpy;

/*!
 * Specification: AutoReload middleware.
 */

describe('autoreload()', function() {
    beforeEach(function() {
        watchSpy = new events.EventEmitter();
        spyOn(gaze, 'Gaze').andReturn(watchSpy);
    });

    describe('options', function() {
        describe('autoreload', function() {
            it('should be enabled by default', function() {
                middleware();
                expect(gaze.Gaze).toHaveBeenCalled();
            });

            it('should be enabled when true', function() {
                middleware({ autoreload: true });
                expect(gaze.Gaze).toHaveBeenCalled();
            });

            it('should be disabled when false', function() {
                middleware({ autoreload: false });
                expect(gaze.Gaze).not.toHaveBeenCalled();
            });
        });
    });

    describe('soundwave.serve', function() {
        beforeEach(function() {
            spyOn(http, 'createServer').andReturn({
                on: function() {},
                listen: function() {}
            });
        });

        it('should pass the autoreload option', function() {
            soundwave.serve({ autoreload: true });
            expect(gaze.Gaze).toHaveBeenCalled();
        });
    });

    describe('when up-to-date', function() {
        describe('GET /autoreload', function() {
            it('should return false', function(done) {
                chdir('spec/fixture/app-with-cordova', function() {
                    request(middleware())
                    .get('/autoreload')
                    .end(function(e, res) {
                        expect(res.statusCode).toEqual(200);
                        expect(res.text).toMatch('{"outdated":false}');
                        this.app.close();
                        done();
                    });
                });
            });
        });

        describe('POST /autoreload', function() {
            it('should return false', function(done) {
                chdir('spec/fixture/app-with-cordova', function() {
                    request(middleware())
                    .post('/autoreload')
                    .end(function(e, res) {
                        expect(res.statusCode).toEqual(200);
                        expect(res.text).toMatch('{"outdated":false}');
                        this.app.close();
                        done();
                    });
                });
            });
        });
    });

    describe('when outdated', function() {
        beforeEach(function() {
            gaze.Gaze.andCallFake(function() {
                process.nextTick(function() {
                    watchSpy.emit('all', 'eventType', '/path/to/file.js');
                });
                return watchSpy;
            });
        });

        it('should emit log event', function(done) {
            chdir('spec/fixture/app-with-cordova', function() {
                var emitter = new events.EventEmitter();
                emitter.on('log', function() {
                    expect(arguments[1]).toMatch('/path/to/file.js');
                    done();
                });
                request(middleware({ emitter: emitter }))
                .post('/autoreload')
                .end(function(e, res) {
                    this.app.close();
                });
            });
        });

        describe('GET /autoreload', function() {
            it('should return true', function(done) {
                chdir('spec/fixture/app-with-cordova', function() {
                    request(middleware())
                    .get('/autoreload')
                    .end(function(e, res) {
                        expect(res.statusCode).toEqual(200);
                        expect(res.text).toMatch('{"outdated":true}');
                        this.app.close();
                        done();
                    });
                });
            });
        });

        describe('POST /autoreload', function() {
            it('should return false', function(done) {
                chdir('spec/fixture/app-with-cordova', function() {
                    request(middleware())
                    .post('/autoreload')
                    .end(function(e, res) {
                        expect(res.statusCode).toEqual(200);
                        expect(res.text).toMatch('{"outdated":false}');
                        this.app.close();
                        done();
                    });
                });
            });
        });
    });
});
