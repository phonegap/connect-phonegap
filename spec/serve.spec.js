/*!
 * Module dependencies.
 */

var chokidar = require('chokidar'),
    events = require('events'),
    http = require('http'),
    ip = require('../lib/util/ip'),
    phonegap = require('../lib'),
    request = require('request'),
    options,
    serverSpy,
    socket,
    watchSpy;

/*!
 * Specification: phonegap.serve(options, [callback])
 */

describe('phonegap.serve(options, [callback])', function() {
    beforeEach(function() {
        spyOn(chokidar, 'watch').and.returnValue({
            on: function() {},
            close: function() {}
        });
        options = {};
        serverSpy = new events.EventEmitter();
        serverSpy.listen = jasmine.createSpy('listen').and.returnValue(serverSpy);
        spyOn(http, 'createServer').and.returnValue(serverSpy);
        spyOn(request, 'get').and.callFake(function(options, callback) {
            var res = { req: { connection: { localAddress: '10.0.1.4' } } };
            callback(null, res, 'data');
        });
    });

    it('should not require options', function() {
        expect(function() {
            phonegap.serve();
        }).not.toThrow();
    });

    it('should not require options.port', function() {
        expect(function() {
            options.port = undefined;
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
            serverSpy.emit('listening');
        });

        it('should emit a "complete" event', function(done) {
            phonegap.serve(options).on('complete', function(data) {
                ip.address(function(e, address) {
                    expect(e).toBeNull();
                    expect(data.port).toEqual(3000);
                    expect(data.server).toEqual(serverSpy);
                    expect(data.address).toEqual(address);
                    expect(data.address).not.toEqual('unknown');
                    done();
                });
            });
            serverSpy.emit('listening');
        });

        describe('on request', function() {
            it('should emit a "log" event', function(done) {
                // test the log event
                phonegap.serve(options).on('log', function(statusCode, url) {
                    expect(statusCode).toEqual(200);
                    expect(url).toEqual('/a/file');
                    done();
                });

                // setup the request and response objects
                var req = { url: '/a/file' },
                    res = new events.EventEmitter();

                // create a fake server request
                serverSpy.emit('request', req, res);

                // wait a moment then fake the response
                process.nextTick(function() {
                    res.statusCode = 200;
                    res.emit('finish');
                });
            });
        });

        describe('on connection', function() {
            beforeEach(function() {
                socket = require('net').Socket();
            });

            it('sockets list should be non-empty', function(done) {
                var server = phonegap.serve(options).on('connection', function() {
                    expect(options.sockets).not.toEqual({});
                    expect(options.sockets[0]).toEqual(socket);
                    done();
                });

                serverSpy.emit('connection', socket);
            });

            it('sockets list should be empty when server is closed', function(done) {
                spyOn(socket, 'destroy').and.callFake(function() {
                    socket._events.close();
                });

                var server = phonegap.serve(options).on('close', function() {
                    expect(options.sockets).toEqual({});
                    done();
                });

                serverSpy.emit('connection', socket);

                server.close = function() {
                    serverSpy.emit('close');
                };
                server.closeServer();
            });
        });
    });

    describe('when failed to create server', function() {
        it('should fire "error" event', function(done) {
            phonegap.serve(options).on('error', function(e) {
                expect(e).toEqual(jasmine.any(Error));
                done();
            });
            serverSpy.emit('error', new Error('port in use'));
        });
    });
});

// Had to separate these tests out because they require a different
// spyOn(chokidar, 'watch') than the tests above
describe('phonegap.serve(options, [callback]) on middleware event', function() {
    beforeEach(function() {
        watchSpy = new events.EventEmitter();
        // use chokidar as tester but can be any event-emitting middleware
        spyOn(chokidar, 'watch').and.callFake(function() {
            process.nextTick(function() {
                watchSpy.emit('all', 'eventType', '/path/to/file.js');
                watchSpy.emit('error', new Error('an error'));
            });
            return watchSpy;
        });
        serverSpy = new events.EventEmitter();
        serverSpy.listen = jasmine.createSpy('listen').and.returnValue(serverSpy);
        spyOn(http, 'createServer').and.returnValue(serverSpy);
        spyOn(request, 'get').and.callFake(function(options, callback) {
            var res = { req: { connection: { localAddress: '10.0.1.4' } } };
            callback(null, res, 'data');
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
