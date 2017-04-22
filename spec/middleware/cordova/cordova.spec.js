/*!
 * Module dependencies.
 */

var chdir = require('chdir'),
    gaze = require('gaze'),
    phonegap = require('../../../lib'),
    request = require('supertest'),
    useragent = require('../../../lib/middleware/ext/useragent');

/*!
 * Specification: serve cordova.js or phonegap.js
 */

describe('cordova.js middleware', function() {
    beforeEach(function() {
        spyOn(gaze, 'Gaze').and.returnValue({ on: function() {} });
        spyOn(useragent, 'parse').and.returnValue({ ios: true, platform: 'ios' });
    });

    describe('when cordova.js exists', function () {
        it('should do nothing', function(done) {
            chdir('spec/fixture/app-with-cordova', function() {
                request(phonegap()).get('/cordova.js').end(function(e, res) {
                    expect(res.statusCode).toEqual(200);
                    expect(res.text).toMatch('i am cordova');
                    done();
                });
            });
        });
    });

    describe('when cordova.js not exists', function () {
        describe('on Android', function() {
            beforeEach(function() {
                useragent.parse.and.returnValue({ android: true, platform: 'android' });
            });

            it('should serve cordova.js', function(done) {
                chdir('spec/fixture/app-without-cordova', function() {
                    request(phonegap()).get('/cordova.js').end(function(e, res) {
                        expect(res.statusCode).toEqual(200);
                        expect(res.text).toMatch('// Platform: android');
                        done();
                    });
                });
            });
        });

        describe('on iOS', function() {
            it('should serve cordova.js', function(done) {
                chdir('spec/fixture/app-without-cordova', function() {
                    request(phonegap()).get('/cordova.js').end(function(e, res) {
                        expect(res.statusCode).toEqual(200);
                        expect(res.text).toMatch('// Platform: ios');
                        done();
                    });
                });
            });
        });
    });

    describe('when phonegap.js exists', function () {
        it('should do nothing', function(done) {
            chdir('spec/fixture/app-with-cordova', function() {
                request(phonegap()).get('/phonegap.js').end(function(e, res) {
                    expect(res.statusCode).toEqual(200);
                    expect(res.text).toMatch('i am phonegap');
                    done();
                });
            });
        });
    });

    describe('when phonegap.js not exists', function () {
        it('should serve phonegap.js', function(done) {
            chdir('spec/fixture/app-without-cordova', function() {
                request(phonegap()).get('/phonegap.js').end(function(e, res) {
                    expect(res.statusCode).toEqual(200);
                    expect(res.text).toMatch('// Platform: ios');
                    done();
                });
            });
        });
    });
});
