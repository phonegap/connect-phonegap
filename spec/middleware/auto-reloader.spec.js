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
 * Specification: auto-reloader middleware
 */

describe('auto-reloader()', function() {
    beforeEach(function() {
        spyOn(gaze, 'Gaze').andReturn({ on: function() {} });
    });

    it('should get a JSON response', function(done) {
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

    describe('options', function() {
        describe('auto-reload', function() {
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
        it('should pass the auto-reload option', function() {
            spyOn(http, 'createServer').andReturn({
                on: function() {},
                listen: function() {}
            });
            soundwave.serve({ autoreload: true });
            expect(gaze.Gaze).toHaveBeenCalled();
        });
    });
});
