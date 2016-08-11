/*!
 * Module dependencies.
 */

var events = require('events'),
    gaze = require('gaze'),
    http = require('http'),
    phonegap = require('../../lib'),
    cordovaAPI = require('../../lib/util/cordova-API-access'),
    Q = require('q'),
    gazeSpy,
    options,
    pg;

var platformSpy;
var prepareSpy;

/*!
 * Specification: Browser middleware.
 */

describe('browser middleware', function() {
    beforeEach(function() {
        gazeSpy = new events.EventEmitter();
        spyOn(gaze, 'Gaze').andReturn(gazeSpy);

        options = {
            browser: true,
            phonegap: {
                util: {
                    cordova: {
                        platform: jasmine.createSpy('platform'),
                        prepare: jasmine.createSpy('prepare')
                    }
                }
            }
        };


        platformSpy = jasmine.createSpy('platform');
        prepareSpy = jasmine.createSpy('prepare');

        spyOn(cordovaAPI, 'getCordova').andCallFake(function(){
            return Q().then(function(){
                return {
                    platform : platformSpy,
                    prepare : prepareSpy
                }
            });
        });
    });

    afterEach(function(){
        this.removeAllSpies();
    });

    describe('on file change', function() {
        it('should call cordova prepare by default', function(done) {
            pg = phonegap(options);

            gazeSpy.emit('all', 'eventType', '/path/to/file.js');
            process.nextTick(function() {
                expect(prepareSpy)
                    .toHaveBeenCalledWith([], jasmine.any(Function));
                done();
            });
        }, 2000000);

        it('should not call cordova prepare when flag is set', function(done) {
            options.browser = false;
            pg = phonegap(options);

            gazeSpy.emit('all', 'eventType', '/path/to/file.js');
            process.nextTick(function() {
                expect(prepareSpy)
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
            process.nextTick(function(){
                expect(platformSpy)
                    .toHaveBeenCalledWith('add', 'browser', jasmine.any(Function));
                done();
            });
        });

        it('should not add browser platform when flag is set', function(done) {
            gazeSpy.listen = jasmine.createSpy('listen').andReturn(gazeSpy);
            spyOn(http, 'createServer').andReturn(gazeSpy);
            options.browser = false;

            phonegap.serve(options);
            expect(platformSpy)
                .not.toHaveBeenCalled();
            done();
        });
    });
});
