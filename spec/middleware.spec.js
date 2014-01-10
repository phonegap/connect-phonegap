/*!
 * Module dependencies.
 */

var soundwave = require('../lib'),
    request = require('supertest');

/*!
 * Specification: middleware
 */

describe('middleware()', function() {
    it('should be a request listener', function(done) {
        request(soundwave()).get('/').end(function(e, res) {
            expect(res.statusCode).toEqual(404);
            this.app.close();
            done();
        });
    });
});
