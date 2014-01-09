/*!
 * Module dependencies.
 */

var middleware = require('../lib/middleware'),
    request = require('supertest'),
    chdir = require('chdir');


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

    it('should serve www/', function(done) {
        chdir('spec/fixture', function() {
            request(middleware())
                .get('/')
                .end(function(e, res) {
                    expect(res.statusCode).toEqual(200);
                    expect(res.text).toEqual('Hello World\n');
                    this.app.close();
                    done();
                });
        });
    });
});
