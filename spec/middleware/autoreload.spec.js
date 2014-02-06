/*!
 * Module dependencies.
 */

var chdir = require('chdir'),
    events = require('events'),
    gaze = require('gaze'),
    http = require('http'),
    phonegap = require('../../lib'),
    request = require('supertest'),
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
                phonegap();
                expect(gaze.Gaze).toHaveBeenCalled();
            });

            it('should be enabled when true', function() {
                phonegap({ autoreload: true });
                expect(gaze.Gaze).toHaveBeenCalled();
            });

            it('should be disabled when false', function() {
                phonegap({ autoreload: false });
                expect(gaze.Gaze).not.toHaveBeenCalled();
            });
        });
    });

    describe('phonegap.serve', function() {
        beforeEach(function() {
            spyOn(http, 'createServer').andReturn({
                on: function() {},
                listen: function() {}
            });
        });

        it('should pass the autoreload option', function() {
            phonegap.serve({ autoreload: true });
            expect(gaze.Gaze).toHaveBeenCalled();
        });
    });

    describe('when up-to-date', function() {
        describe('GET /autoreload', function() {
            it('should return false', function(done) {
                chdir('spec/fixture/app-with-cordova', function() {
                    request(phonegap())
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
                    request(phonegap())
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
                request(phonegap({ emitter: emitter }))
                .post('/autoreload')
                .end(function(e, res) {
                    this.app.close();
                });
            });
        });

        describe('GET /autoreload', function() {
            it('should return true', function(done) {
                chdir('spec/fixture/app-with-cordova', function() {
                    request(phonegap())
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
                    request(phonegap())
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
