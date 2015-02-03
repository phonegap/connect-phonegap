/*!
 * Module dependencies.
 */

var ip = require('../../lib/util/ip'),
    ipAddress = require('ip'),
    request = require('request');

/*!
 * Specification.
 */

describe('ip', function() {
    beforeEach(function() {
        spyOn(request, 'get');
    });

    describe('.address(callback)', function() {
        it('should be a function', function () {
            expect(ip.address).toEqual(jasmine.any(Function));
        });

        describe('when external host is reachable', function() {
            beforeEach(function() {
                request.get.andCallFake(function(options, callback) {
                    var res = {
                        req: {
                            connection: {
                                localAddress: '10.0.1.4'
                            },
                            socket: {
                                localAddress: undefined
                            }
                        }
                    };
                    callback(null, res, 'data');
                });
            });

            it('should not return an error', function(done) {
                ip.address(function(e, address) {
                    expect(e).toBeNull();
                    done();
                });
            });

            it('should return an ip address from request', function(done) {
                ip.address(function(e, address) {
                    expect(address).toEqual('10.0.1.4');
                    done();
                });
            });

            describe('when connect.localAddress is undefined', function() {
                beforeEach(function() {
                    request.get.andCallFake(function(options, callback) {
                        var res = {
                            req: {
                                connection: {
                                    localAddress: undefined
                                },
                                socket: {
                                    localAddress: '10.0.1.5'
                                }
                            }
                        };
                        callback(null, res, 'data');
                    });
                });

                it('should return the socket localAddress', function(done) {
                    ip.address(function(e, address) {
                        expect(address).toEqual('10.0.1.5');
                        done();
                    });
                });
            });

            describe('when socket.localAddress is undefined', function() {
                beforeEach(function() {
                    spyOn(ipAddress, 'address').andCallThrough();
                    request.get.andCallFake(function(options, callback) {
                        var res = {
                            req: {
                                connection: {
                                    localAddress: undefined
                                },
                                socket: {
                                    localAddress: undefined
                                }
                            }
                        };
                        callback(null, res, 'data');
                    });
                });

                it('should lookup the network adapter address', function(done) {
                    ip.address(function(e, address) {
                        expect(ipAddress.address).toHaveBeenCalled();
                        expect(address).toEqual(ipAddress.address());
                        done();
                    });
                });
            });
        });

        describe('when external host is not reachable', function() {
            beforeEach(function() {
                request.get.andCallFake(function(options, callback) {
                    callback(new Error('getaddrinfo ENOTFOUND'));
                });
            });

            it('should not return an error', function(done) {
                ip.address(function(e, address) {
                    expect(e).toBeNull();
                    done();
                });
            });

            it('should return ip address from adapter', function(done) {
                ip.address(function(e, address) {
                    expect(address).toEqual(require('ip').address());
                    done();
                });
            });
        });
    });
});
