/*!
 * Module dependencies.
 */

var address = require('address'),
    events = require('events'),
    gaze = require('gaze'),
    http = require('http'),
    phonegap = require('../lib'),
    options,
    serverSpy,
    watchSpy;

/*!
 * Specification: phonegap.serve(options, [callback])
 */

describe('phonegap.serve(options, [callback])', function() {
    beforeEach(function() {
        options = {};
        serverSpy = new events.EventEmitter();
        serverSpy.listen = jasmine.createSpy('listen').andReturn(serverSpy);
        spyOn(http, 'createServer').andReturn(serverSpy);
    });

    it('should require options', function() {
        expect(function() {
            options = undefined;
            phonegap.serve(options, function(e) {});
        }).toThrow();
    });

    it('should not require options.port', function() {
        expect(function() {
            options.port = undefined;
            phonegap.serve(options, function(e) {});
        }).not.toThrow();
    });

    it('should not require callback', function() {
        expect(function() {
            phonegap.serve(options);
        }).not.toThrow();
    });

    it('should return server instance', function() {
        expect(phonegap.serve(options)).toEqual(serverSpy);
    });

    it('should try to create the server', function() {
        phonegap.serve(options);
        expect(serverSpy.listen).toHaveBeenCalled();
    });

    describe('when successfully created server', function() {
        it('should listen on the default port (3000)', function() {
            phonegap.serve(options);
            expect(serverSpy.listen).toHaveBeenCalledWith(3000);
        });

        it('should listen on the specified port', function() {
            options.port = 1337;
            phonegap.serve(options);
            expect(serverSpy.listen).toHaveBeenCalledWith(1337);
        });

        it('should emit a "log" event when listening', function(done) {
            phonegap.serve(options).on('log', function(message) {
                expect(message).toMatch('listening on');
                done();
            });
            serverSpy.emit('listening', 'listening on 10.0.1.195:1337');
        });

        it('should trigger callback with data object', function(done) {
            phonegap.serve(options, function(e, data) {
                expect(data).toEqual({
                    server: serverSpy,
                    address: address.ip(),
                    port: 3000
                });
                done();
            });
            serverSpy.emit('listening');
        });

        describe('on request', function() {
            it('should emit a "log" event', function(done) {
                phonegap.serve(options).on('log', function(statusCode, url) {
                    expect(statusCode).toEqual(200);
                    expect(url).toEqual('/a/file');
                    done();
                });
                serverSpy.emit('request', { url: '/a/file' }, { statusCode: 200 });
            });
        });

        describe('on middleware event', function() {
            beforeEach(function() {
                watchSpy = new events.EventEmitter();
                // use gaze as tester but can be any event-emitting middleware
                spyOn(gaze, 'Gaze').andCallFake(function() {
                    process.nextTick(function() {
                        watchSpy.emit('all', 'eventType', '/path/to/file.js');
                        watchSpy.emit('error', new Error('an error'));
                    });
                    return watchSpy;
                });
            });

            it('should receive log event', function(done) {
                var server = phonegap.serve(options).on('log', function() {
                    expect(arguments[1]).toMatch('/path/to/file.js');
                    done();
                });
            });

            it('should receive error event', function(done) {
                var server = phonegap.serve(options).on('error', function(e) {
                    expect(e).toEqual(jasmine.any(Error));
                    done();
                });
            });
        });
    });

    describe('when failed to create server', function() {
        it('should trigger callback with an error', function(done) {
            phonegap.serve(options, function(e) {
                expect(e).toEqual(jasmine.any(Error));
                done();
            });
            serverSpy.emit('error', new Error('port in use'));
        });

        it('should fire "error" event', function(done) {
            phonegap.serve(options).on('error', function(e) {
                expect(e).toEqual(jasmine.any(Error));
                done();
            });
            serverSpy.emit('error', new Error('port in use'));
        });
    });
});
