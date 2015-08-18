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

        options = {
            phonegap: {
                cordova: jasmine.createSpy('cordova')
            }
        };
    });

    describe('on file change', function() {
        it('should call cordova prepare', function(done) {
            pg = phonegap(options);

            gazeSpy.emit('all', 'eventType', '/path/to/file.js');
            process.nextTick(function() {
                expect(options.phonegap.cordova)
                    .toHaveBeenCalledWith({ cmd: 'cordova prepare browser' });
                done();
            });
        });
    });

    describe('on phonegap serve', function() {
            it('should add browser platform', function(done) {
                gazeSpy.listen = jasmine.createSpy('listen').andReturn(gazeSpy);
                spyOn(http, 'createServer').andReturn(gazeSpy);

                phonegap.serve(options);
                expect(options.phonegap.cordova)
                    .toHaveBeenCalledWith({ cmd: 'cordova platform add browser' });
                done();
            });
    });
});
