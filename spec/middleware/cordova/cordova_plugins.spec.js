/*!
 * Module dependencies.
 */
var chdir = require('chdir'),
    gaze = require('gaze'),
    phonegap = require('../../../lib'),
    request = require('supertest'),
    useragent = require('../../../lib/middleware/ext/useragent');

/*!
 * Specification: serve cordova_plugin js
 */

describe('cordova_plugins.js middleware', function() {
    beforeEach(function() {
        spyOn(gaze, 'Gaze').andReturn({ on: function() {} });
        spyOn(useragent, 'parse').andReturn({ ios: true, platform: 'ios' });
    });

    describe('when cordova_plugins.js exists', function () {
        it('should do nothing', function(done) {
            chdir('spec/fixture/app-with-cordova', function() {
                request(phonegap()).get('/cordova_plugins.js').end(function(e, res) {
                    expect(res.statusCode).toEqual(200);
                    expect(res.text).toMatch('i am cordova plugins');
                    done();
                });
            });
        });
    });

    describe('when cordova_plugins.js not exists', function () {
        describe('on Android', function() {
            beforeEach(function() {
                useragent.parse.andReturn({ android: true, platform: 'android' });
            });

            it('should serve cordova_plugins.js', function(done) {
                chdir('spec/fixture/app-without-cordova', function() {
                    request(phonegap()).get('/cordova_plugins.js').end(function(e, res) {
                        expect(res.statusCode).toEqual(200);
                        expect(res.text).toMatch('www/android');
                        done();
                    });
                });
            });
        });

        describe('on iOS', function() {
            it('should serve cordova_plugins.js', function(done) {
                chdir('spec/fixture/app-without-cordova', function() {
                    request(phonegap()).get('/cordova_plugins.js').end(function(e, res) {
                        expect(res.statusCode).toEqual(200);
                        expect(res.text).toMatch('www/ios');
                        done();
                    });
                });
            });
        });
    });
});
