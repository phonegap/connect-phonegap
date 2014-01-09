/*!
 * Module dependencies.
 */

var middleware = require('../lib/middleware'),
    request = require('supertest');


/*!
 * Specification: middleware
 */

describe('middleware()', function() {
    it('should be a request listener', function(done) {
        request(middleware())
            .get('/')
            .end(function(e, res) {
                expect(res.statusCode).toEqual(404);
                this.app.close();
                done();
            });
    });
});
