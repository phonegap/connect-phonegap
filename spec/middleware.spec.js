/*!
 * Module dependencies.
 */

var phonegap = require('../lib'),
    request = require('supertest');

/*!
 * Specification: phonegap-connect middleware
 */

describe('phonegap-connect()', function() {
    it('should return a request listener', function(done) {
        request(phonegap()).get('/').end(function(e, res) {
            expect(res.statusCode).toEqual(404);
            done();
        });
    });

    describe('request listener', function() {
        it('should have an emitter interface attached', function(done) {
            var middleware = phonegap();
            middleware.on('log', function(message) {
                expect(message).toEqual('hello');
                expect(middleware.listeners('log').length).toEqual(1);
                middleware.removeAllListeners();
                expect(middleware.listeners('log').length).toEqual(0);
                done();
            });
            middleware.emit('log', 'hello');
        });
    });
});
