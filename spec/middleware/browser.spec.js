/*!
 * Module dependencies.
 */

var events = require('events'),
    gaze = require('gaze'),
    http = require('http'),
    phonegap = require('../../lib'),
    gazeSpy,
    options,
    pg;

/*!
 * Specification: Browser middleware.
 */

describe('browser middleware', function() {
    beforeEach(function() {
        gazeSpy = new events.EventEmitter();
        spyOn(gaze, 'Gaze').andReturn(gazeSpy);
        spyOn(global, 'setInterval');

        options = {
            browser: true,
            phonegap: {
                cordova: jasmine.createSpy('cordova')
            }
        };
    });

    describe('on file change', function() {
        it('should call cordova prepare by default', function(done) {
            pg = phonegap(options);

            gazeSpy.emit('all', 'eventType', '/path/to/file.js');
            process.nextTick(function() {
                expect(options.phonegap.cordova)
                    .toHaveBeenCalledWith({ cmd: 'cordova prepare browser' },
                                            jasmine.any(Function));
                done();
            });
        });

        it('should not call cordova prepare when flag is set', function(done) {
            options.browser = false;
            pg = phonegap(options);

            gazeSpy.emit('all', 'eventType', '/path/to/file.js');
            process.nextTick(function() {
                expect(options.phonegap.cordova)
                    .not.toHaveBeenCalled();
                done();
            });
        });
    });

    describe('on phonegap serve', function() {
        it('should add browser platform by default', function(done) {
            gazeSpy.listen = jasmine.createSpy('listen').andReturn(gazeSpy);
            spyOn(http, 'createServer').andReturn(gazeSpy);

            phonegap.serve(options);
            expect(options.phonegap.cordova)
                .toHaveBeenCalledWith({ cmd: 'cordova platform add browser@4.0.0' });
            done();
        });

        it('should not add browser platform when flag is set', function(done) {
            gazeSpy.listen = jasmine.createSpy('listen').andReturn(gazeSpy);
            spyOn(http, 'createServer').andReturn(gazeSpy);
            options.browser = false;

            phonegap.serve(options);
            expect(options.phonegap.cordova)
                .not.toHaveBeenCalled();
            done();
        });
    });
});
