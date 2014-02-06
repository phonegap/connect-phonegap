/*!
 * Module dependencies.
 */

var middleware = require('../lib/middleware'),
    phonegap = require('../lib');

/*!
 * Specification: connect-phonegap middleware
 */

describe('connect-phonegap', function() {
    it('should be the middleware generator function', function() {
        expect(phonegap).toEqual(middleware);
    });

    describe('.create(...)', function() {
        it('should be a function', function() {
            expect(phonegap.create).toEqual(jasmine.any(Function));
        });
    });

    describe('.serve(...)', function() {
        it('should be a function', function() {
            expect(phonegap.serve).toEqual(jasmine.any(Function));
        });
    });

    describe('.listen(...)', function() {
        it('should be an alias for .serve(...)', function() {
            expect(phonegap.listen).toEqual(phonegap.serve);
        });
    });
});
