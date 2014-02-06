/*!
 * Module dependencies.
 */

var phonegap = require('../../lib'),
    request = require('supertest');


/*!
 * Specification: no-cache middleware
 */

describe('nocache()', function() {
    it('should set Cache-Control Header', function(done) {
        request(phonegap()).get('/').end(function(e, res) {
            expect(res.headers['cache-control']).toMatch('no-cache');
            this.app.close();
            done();
        });
    });
});
