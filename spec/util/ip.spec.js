/*!
 * Module dependencies.
 */

var ip = require('../../lib/util/ip'),
    ipAddress = require('ip'),
    os = require('os');

/*!
 * Specification.
 */

describe('ip', function() {
    describe('.address(callback, address, addresses)', function() {
        it('should be a function', function () {
            expect(ip.address).toEqual(jasmine.any(Function));
        });

        describe('when one public IPv4 address is present', function() {
            beforeEach(function() {
                spyOn(os, 'networkInterfaces').andReturn({
                    en0: [{
                        family: 'IPv4',
                        internal: false,
                        address: '10.0.1.4'
                    }]
                });
            });

            it('should not return an error', function(done) {
                ip.address(function(e, address, addresses) {
                    expect(e).toBeNull();
                    done();
                });
            });

            it('should return ip address from adapter', function(done) {
                ip.address(function(e, address, addresses) {
                    expect(address).toEqual('10.0.1.4');
                    expect(addresses[0]).toEqual('10.0.1.4');
                    expect(addresses.length).toEqual(1);
                    done();
                });
            });
        });

        describe('when two or more public IPv4 addresses are present', function() {
            beforeEach(function() {
                spyOn(os, 'networkInterfaces').andCallFake(function() {
                    return {
                        en0: [{
                            family: 'IPv4',
                            internal: false,
                            address: '10.0.1.4'
                        }],
                        en1: [{
                            family: 'IPv4',
                            internal: false,
                            address: '10.0.1.5'
                        }]
                    };
                });
            });

            it('should not return an error', function(done) {
                ip.address(function(e, address, addresses) {
                    expect(e).toBeNull();
                    done();
                });
            });

            it('should return ip addresses from adapter', function(done) {
                ip.address(function(e, address, addresses) {
                    expect(address).toEqual('10.0.1.4');
                    expect(addresses[0]).toEqual('10.0.1.4');
                    expect(addresses[1]).toEqual('10.0.1.5');
                    expect(addresses.length).toEqual(2);
                    done();
                });
            });
        });
    });
});
