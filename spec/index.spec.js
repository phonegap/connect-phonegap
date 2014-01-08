/*!
 * Module dependencies.
 */

var soundwave = require('../lib'),
    http = require('http'),
    events = require('events'),
    serverSpy,
    options;

/*!
 * Specification: soundwave.serve(options, [callback])
 */

describe('soundwave.serve(options, [callback])', function() {
    beforeEach(function() {
        options = {};

        // mock the http.createServer
        spyOn(http, 'createServer').andCallFake(function() {
            serverSpy = new events.EventEmitter();
            serverSpy.listen = jasmine.createSpy().andReturn(serverSpy);
            return serverSpy;
        });
    });

    it('should require options', function() {
        expect(function() {
            options = undefined;
            soundwave.serve(options, function(e) {});
        }).toThrow();
    });

    it('should not require options.port', function() {
        expect(function() {
            options.port = undefined;
            soundwave.serve(options, function(e) {});
        }).not.toThrow();
    });

    it('should not require callback', function() {
        expect(function() {
            soundwave.serve(options);
        }).not.toThrow();
    });

    it('should try to serve the project', function() {
        soundwave.serve(options);
        expect(http.createServer).toHaveBeenCalled();
    });

    describe('when successfully started server', function() {
        it('should listen on the default port (3000)', function() {
            soundwave.serve(options);
            expect(serverSpy.listen).toHaveBeenCalledWith(3000);
        });

        it('should listen on the specified port', function() {
            options.port = 1337;
            soundwave.serve(options);
            expect(serverSpy.listen).toHaveBeenCalledWith(1337);
        });

        it('should trigger callback with server object', function(done) {
            soundwave.serve(options, function(e, server) {
                expect(server).toEqual({
                    address: '127.0.0.1',
                    port: 3000
                });
                done();
            });
            serverSpy.emit('listening');
        });

        //describe('on request', function() {
        //    it('should serve a response', function() {
        //        soundwave.serve(options, function(e) {});
        //        request.emit('end');
        //        expect(serveSpy).toHaveBeenCalled();
        //    });

        //    it('should emit a "log" event', function(done) {
        //        serveSpy.andCallFake(function(request, response, callback) {
        //            callback(null, { status: 200 });
        //        });
        //        soundwave.on('log', function(request, response) {
        //            done();
        //        });
        //        soundwave.serve(options);
        //        request.emit('end');
        //    });
        //});
    });

    describe('when failed to start server', function() {
        it('should trigger callback with an error', function(done) {
            soundwave.serve(options, function(e) {
                expect(e).toEqual(jasmine.any(Error));
                done();
            });
            serverSpy.emit('error', new Error('port in use'));
        });

        it('should fire "error" event', function(done) {
            soundwave.on('error', function(e) {
                expect(e).toEqual(jasmine.any(Error));
                done();
            });
            soundwave.serve(options);
            serverSpy.emit('error', new Error('port in use'));
        });
    });
});
