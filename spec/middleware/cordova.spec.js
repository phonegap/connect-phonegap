/*!
 * Module dependencies.
 */

var soundwave = require('../../lib'),
    chdir = require('chdir'),
    gaze = require('gaze'),
    request = require('supertest'),
    useragent = require('../../lib/middleware/ext/useragent');

/*!
 * Specification: serve cordova.js or phonegap.js
 */

describe('middleware/cordova', function() {
    beforeEach(function() {
        spyOn(gaze, 'Gaze').andReturn({ on: function() {} });
        spyOn(useragent, 'parse').andReturn({ ios: true, platform: 'ios' });
    });

    describe('when cordova.js exists', function () {
        it('should do nothing', function(done) {
            chdir('spec/fixture/app-with-cordova', function() {
                request(soundwave()).get('/cordova.js').end(function(e, res) {
                    expect(res.statusCode).toEqual(200);
                    expect(res.text).toMatch('i am cordova');
                    this.app.close();
                    done();
                });
            });
        });
    });

    describe('when cordova.js not exists', function () {
        describe('on Android', function() {
            beforeEach(function() {
                useragent.parse.andReturn({ android: true, platform: 'android' });
            });

            it('should serve cordova.js', function(done) {
                chdir('spec/fixture/app-without-cordova', function() {
                    request(soundwave()).get('/cordova.js').end(function(e, res) {
                        expect(res.statusCode).toEqual(200);
                        expect(res.text).toMatch('// Platform: android');
                        this.app.close();
                        done();
                    });
                });
            });
        });

        describe('on iOS', function() {
            it('should serve cordova.js', function(done) {
                chdir('spec/fixture/app-without-cordova', function() {
                    request(soundwave()).get('/cordova.js').end(function(e, res) {
                        expect(res.statusCode).toEqual(200);
                        expect(res.text).toMatch('// Platform: ios');
                        this.app.close();
                        done();
                    });
                });
            });
        });
    });

    describe('when phonegap.js exists', function () {
        it('should do nothing', function(done) {
            chdir('spec/fixture/app-with-cordova', function() {
                request(soundwave()).get('/phonegap.js').end(function(e, res) {
                    expect(res.statusCode).toEqual(200);
                    expect(res.text).toMatch('i am phonegap');
                    this.app.close();
                    done();
                });
            });
        });
    });

    describe('when phonegap.js not exists', function () {
        it('should serve phonegap.js', function(done) {
            chdir('spec/fixture/app-without-cordova', function() {
                request(soundwave()).get('/phonegap.js').end(function(e, res) {
                    expect(res.statusCode).toEqual(200);
                    expect(res.text).toMatch('// Platform: ios');
                    this.app.close();
                    done();
                });
            });
        });
    });
});
