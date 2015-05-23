/*!
 * Module dependencies.
 */

var chdir = require('chdir'),
    events = require('events'),
    gaze = require('gaze'),
    phonegap = require('../../lib'),
    request = require('supertest'),
    watchSpy;


/*!
 * Specification: pushstate middleware
 */

describe('push state middleware', function() {
    beforeEach(function() {
        watchSpy = new events.EventEmitter();
        spyOn(gaze, 'Gaze').andReturn(watchSpy);
    });

    describe('options', function() {
        describe('push state', function() {
            it('should be enabled by default', function() {
                phonegap();
                expect(gaze.Gaze).toHaveBeenCalled();
            });

            it('should be enabled when true', function() {
                phonegap({ pushState: true });
                expect(gaze.Gaze).toHaveBeenCalled();
            });

            it('should be disabled when false', function() {
                phonegap({ pushState: false });
                expect(gaze.Gaze).not.toHaveBeenCalled();
            });
        });
    });

    describe('phonegap.serve', function() {
        beforeEach(function() {
            spyOn(http, 'createServer').andReturn({
                on: function() {},
                listen: function() {},
                listeners:function(){return []},
                removeAllListeners:function(){}
            });
        });

        it('should pass the autoreload option', function() {
            phonegap.serve({ pushState: true });
            expect(gaze.Gaze).toHaveBeenCalled();
        });
    });


    it('should serve index file on non-existent url', function(done) {
        chdir('spec/fixture/app-without-cordova', function() {
            request(phonegap()).get('/does-not-exist').end(function(e, res) {
                expect(res.statusCode).toEqual(200);
                expect(res.text).toMatch('<title>Hello World</title>');
                done();
            });
        });
    });

    it('should not serve index file on non-existent url when disabled', function(done) {
        chdir('spec/fixture/app-without-cordova', function() {
            request(phonegap({pushState: false})).get('/does-not-exist').end(function(e, res) {
                expect(res.statusCode).toEqual(404);
                done();
            });
        });
    });
});
