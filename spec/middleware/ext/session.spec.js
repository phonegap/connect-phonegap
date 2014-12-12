/*!
 * Module dependencies.
 */

var session = require('../../../lib/middleware/ext/session'),
    useragent = require('../../../lib/middleware/ext/useragent'),
    query,
    req;

/*!
 * Specification: session management
 */

describe('session', function() {
    beforeEach(function() {
        req = {
            headers: [], // stub for useragent detection
            session: {}  // stub for session management
        };
        spyOn(useragent, 'parse').andReturn({
            platform: 'android'
        });
    });

    describe('.init(req)', function() {
        describe('default device values', function() {
            it('should create device object', function() {
                expect(req.session.device).not.toBeDefined();
                session.device.init(req);
                expect(req.session.device).toBeDefined();
            });

            it('should set platform from user-agent', function() {
                session.device.init(req);
                expect(req.session.device.platform).toEqual('android');
            });

            it('should set version to defined default', function() {
                session.device.init(req);
                expect(req.session.device.version).toEqual(
                    session.device.available()['default'].android
                );
            });

            describe('wp8', function() {
                beforeEach(function() {
                    useragent.parse.andReturn({
                        platform: 'wp8'
                    });
                });

                it('should set platform to wp8', function() {
                    session.device.init(req);
                    expect(req.session.device.platform).toEqual('wp8');
                });

                it('should set version to defined default', function() {
                    session.device.init(req);
                    expect(req.session.device.version).toEqual(
                        session.device.available()['default'].wp8
                    );
                });
            });
        });
    });

    describe('.set(req, query)', function() {
        beforeEach(function() {
            query = {
                platform: 'Android',
                version: '3.4.0'
            };
        });

        describe('query parameter', function() {
            describe('when undefined', function() {
                it('should not set the device', function() {
                    query = undefined;
                    expect(session.device.set(req, query).current).not.toBeDefined();
                });
            });

            describe('.platform is undefined', function() {
                it('should not set the device', function() {
                    query.platform = undefined;
                    expect(session.device.set(req, query).current).not.toBeDefined();
                });
            });

            describe('.version is undefined', function() {
                it('should not set the device', function() {
                    query.version = undefined;
                    expect(session.device.set(req, query).current).not.toBeDefined();
                });
            });
        });

        describe('when successful', function() {
            it('should return the current target', function() {
                expect(session.device.set(req, query).current).toEqual({
                    platform: 'android',
                    version: '3.4.0'
                });
            });

            it('should return the available targets', function() {
                expect(session.device.set(req, query).available).toEqual(jasmine.any(Object));
            });
        });

        describe('when failed', function() {
            beforeEach(function() {
                query.platform = undefined;
            });

            it('should not return the current target', function() {
                expect(session.device.set(req, query).current).not.toBeDefined();
            });

            it('should return the available targets', function() {
                expect(session.device.set(req, query).available).toEqual(jasmine.any(Object));
            });
        });

    });
});
