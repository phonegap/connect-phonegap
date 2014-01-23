/*!
 * Module dependencies.
 */

var middleware = require('../../lib/middleware'),
    gaze = require('gaze'),
    request = require('supertest'),
    chdir = require('chdir');

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
});
