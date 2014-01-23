/*!
 * Module dependencies.
 */

var middleware = require('../../lib/middleware'),
    chdir = require('chdir'),
    gaze = require('gaze'),
    request = require('supertest');


/*!
 * Specification: static middleware
 */

describe('static()', function() {
    beforeEach(function() {
        spyOn(gaze, 'Gaze').andReturn({ on: function() {} });
    });

    it('should serve www/', function(done) {
        chdir('spec/fixture/app-without-cordova', function() {
            request(middleware()).get('/').end(function(e, res) {
                expect(res.statusCode).toEqual(200);
                expect(res.text).toMatch('<title>Hello World</title>');
                this.app.close();
                done();
            });
        });
    });
});
