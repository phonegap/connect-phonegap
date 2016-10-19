/*!
 * Module dependencies.
 */

var gaze = require('gaze'),
    phonegap = require('../../lib'),
    request = require('supertest');


/*!
 * Specification: no-cache middleware
 */

describe('no-cache middleware', function() {
    beforeEach(function() {
        spyOn(gaze, 'Gaze').andReturn({ on: function() {} });
    });

    it('should set Cache-Control Header', function(done) {
        request(phonegap()).get('/').end(function(e, res) {
            expect(res.headers['cache-control']).toMatch('no-cache');
            done();
        });
    });
});
