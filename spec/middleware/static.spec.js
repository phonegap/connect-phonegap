/*!
 * Module dependencies.
 */

var middleware = require('../../lib/middleware'),
    request = require('supertest'),
    chdir = require('chdir');


/*!
 * Specification: static middleware
 */

describe('static()', function() {
    it('should serve www/', function(done) {
        chdir('spec/fixture', function() {
            request(middleware())
                .get('/')
                .end(function(e, res) {
                    expect(res.statusCode).toEqual(200);
                    console.log(res.text);
                    expect(res.text).toMatch('<title>Hello World</title>');
                    this.app.close();
                    done();
                });
        });
    });
});
