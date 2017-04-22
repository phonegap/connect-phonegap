/*!
 * Module dependencies.
 */

var chdir = require('chdir'),
    gaze = require('gaze'),
    phonegap = require('../../lib'),
    request = require('supertest');


/*!
 * Specification: static middleware
 */

describe('static middleware', function() {
    beforeEach(function() {
        spyOn(gaze, 'Gaze').and.returnValue({ on: function() {} });
    });

    it('should serve www/', function(done) {
        chdir('spec/fixture/app-without-cordova', function() {
            request(phonegap()).get('/').end(function(e, res) {
                expect(res.statusCode).toEqual(200);
                expect(res.text).toMatch('<title>Hello World</title>');
                done();
            });
        });
    });
});
