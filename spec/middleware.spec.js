/*!
 * Module dependencies.
 */

var middleware = require('../lib/middleware'),
    request = require('supertest');


/*!
 * Specification: middleware
 */

describe('middleware()', function() {
    it('should accept a request', function(done) {
        request(middleware())
            .get('/')
            .end(function(e, res) {
                expect(res.statusCode).toEqual(404);
                this.app.close();
                done();
            });
    });
});
