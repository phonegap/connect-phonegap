/*!
 * Module dependencies.
 */

var ip = require('../../lib/util/ip'),
    net = require('net');

/*!
 * Specification.
 */

describe('IP Address', function() {
    beforeEach(function() {
        spyOn(net, 'createConnection').andReturn({
            address: function() {
                return '0.0.0.0';
            },
            on: function() {}
        });
    });

    it('should be a function', function () {
        expect(ip).toEqual(jasmine.any(Function));
    });

    describe('execution', function() {
        beforeEach(function() {
            ip.ipAddress = null;
            ip(function() {});
        });

        it("should call net.createConnection", function () {
            expect(net.createConnection).toHaveBeenCalledWith(80, 'www.google.com');
        });
    });
});
