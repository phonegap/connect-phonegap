/*!
 * Module dependencies.
 */

var middleware = require('../../lib/middleware'),
    gaze = require('gaze'),
    http = require('http'),
    request = require('supertest'),
    soundwave = require('../../lib'),
    chdir = require('chdir'),
    options;

/*!
 * Specification: AutoReload middleware.
 */

describe('autoreload()', function() {
    beforeEach(function() {
        spyOn(gaze, 'Gaze').andReturn({ on: function() {} });
    });

    it('should get a JSON response using a get request', function(done) {
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

    it('should get a JSON response using a post request', function(done) {
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
        it('should pass the autoreload option', function() {
            spyOn(http, 'createServer').andReturn({
                on: function() {},
                listen: function() {}
            });
            soundwave.serve({ autoreload: true });
            expect(gaze.Gaze).toHaveBeenCalled();
        });
    });
});
