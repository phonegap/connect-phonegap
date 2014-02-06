/*!
 * Module dependencies.
 */

var phonegap = require('../lib'),
    request = require('supertest');

/*!
 * Specification: phonegap-connect middleware
 */

describe('phonegap-connect()', function() {
    it('should be a request listener', function(done) {
        request(phonegap()).get('/').end(function(e, res) {
            expect(res.statusCode).toEqual(404);
            this.app.close();
            done();
        });
    });
});
