/*!
 * Module dependencies.
 */

var middleware = require('../../lib/middleware'),
    request = require('supertest');


/*!
 * Specification: no-cache middleware
 */

describe('nocache()', function() {
    it('should set Cache-Control Header', function(done) {
        request(middleware()).get('/').end(function(e, res) {
            expect(res.headers['cache-control']).toMatch('no-cache');
            this.app.close();
            done();
        });
    });
});
