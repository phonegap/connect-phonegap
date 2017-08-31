/*!
 * Module dependencies.
 */

var chokidar = require('chokidar'),
    events = require('events'),
    http = require('http'),
    phonegap = require('../../lib'),
    chokidarSpy,
    options,
    pg;

/*!
 * Specification: Browser middleware.
 */

describe('browser middleware', function() {
    beforeEach(function() {
        chokidarSpy = new events.EventEmitter();
        spyOn(chokidar, 'watch').and.returnValue(chokidarSpy);

        options = {
            browser: true,
            phonegap: {
                cordova: jasmine.createSpy('cordova'),
                util: {
                    cordova: {
                        prepare: jasmine.createSpy('prepare')
                    }
                }
            }
        };
    });

    describe('on file change', function() {
        it('should call cordova prepare by default', function(done) {
            pg = phonegap(options);

            chokidarSpy.emit('all', 'eventType', '/path/to/file.js');
            process.nextTick(function() {
                expect(options.phonegap.util.cordova.prepare)
                    .toHaveBeenCalledWith([], jasmine.any(Function));
                done();
            });
        });

        it('should not call cordova prepare when flag is set', function(done) {
            options.browser = false;
            pg = phonegap(options);

            chokidarSpy.emit('all', 'eventType', '/path/to/file.js');
            process.nextTick(function() {
                expect(options.phonegap.util.cordova.prepare)
                    .not.toHaveBeenCalled();
                done();
            });
        });
    });

    describe('on phonegap serve', function() {
        it('should add browser platform by default', function(done) {
            chokidarSpy.listen = jasmine.createSpy('listen').and.returnValue(chokidarSpy);
            spyOn(http, 'createServer').and.returnValue(chokidarSpy);

            phonegap.serve(options);
            expect(options.phonegap.cordova)
                .toHaveBeenCalledWith({ cmd: 'cordova platform add browser --nosave' }, jasmine.any(Function));
            done();
        });

        it('should not add browser platform when flag is set', function(done) {
            chokidarSpy.listen = jasmine.createSpy('listen').and.returnValue(chokidarSpy);
            spyOn(http, 'createServer').and.returnValue(chokidarSpy);
            options.browser = false;

            phonegap.serve(options);
            expect(options.phonegap.cordova).not.toHaveBeenCalled();
            done();
        });
    });
});
