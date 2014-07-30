/*!
 * Module dependencies.
 */

var chdir = require('chdir'),
    gaze = require('gaze'),
    phonegap = require('../../lib'),
    request = require('supertest'),
    useragent = require('../../lib/middleware/ext/useragent'),
    path = require('path');

var platformDirs = path.join(__dirname, '../fixture/app-with-platforms/platforms');

var vopts = { 
    vdir: { 
        android: path.join(platformDirs, 'android/assets/www'),
        ios: { 
            v3_2_0: path.join(platformDirs, 'ios/v3_2_0/www'),
        }
    }
};


/*!
 * Specification: serve cordova.js or phonegap.js
 */ 

describe('cordova.js middleware', function() {
    beforeEach(function() {
        spyOn(gaze, 'Gaze').andReturn({ on: function() {} });
        spyOn(useragent, 'parse').andReturn({ ios: true, platform: 'ios' });
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
                useragent.parse.andReturn({ android: true, platform: 'android' });
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
            
            it('should serve vdir android cordova.js', function(done) {
                chdir('spec/fixture/app-with-platforms', function() {
                    request(phonegap(vopts)).get('/cordova.js').end(function(e, res) {
                        expect(res.statusCode).toEqual(200);
                        expect(res.text).toMatch('// platforms/android/assets/www/cordova.js');
                        done();
                    });
                });
            });
        });

        describe('on iOS', function() {
            beforeEach(function() {
                useragent.parse.andReturn({ ios: true, platform: 'ios', version: '3.2.0' });
            });

            it('should serve cordova.js', function(done) {
                chdir('spec/fixture/app-without-cordova', function() {
                    request(phonegap()).get('/cordova.js').end(function(e, res) {
                        expect(res.statusCode).toEqual(200);
                        expect(res.text).toMatch('// Platform: ios');
                        done();
                    });
                });
            });
            
            it('should serve vdir ios 3.2.0 cordova.js', function(done) {
                chdir('spec/fixture/app-with-platforms', function() {
                    request(phonegap(vopts)).get('/cordova.js').end(function(e, res) {
                        expect(res.statusCode).toEqual(200);
                        expect(res.text).toMatch('// platforms/ios/v3_2_0/www/cordova.js');
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

/*!
 * Specification: plugins middleware
 */

describe('plugins/**/*.js middleware', function() {
    beforeEach(function() {
        spyOn(useragent, 'parse').andReturn({ ios: true, platform: 'ios' });
    });

    it('should load a plugin given a valid path', function(done) {
        request(phonegap())
        .get('/plugins/org.apache.cordova.file/www/DirectoryEntry.js')
        .end(function(e, res) {
            expect(res.statusCode).toEqual(200);
            expect(res.text).toMatch(' * An interface representing a directory on the file system.');
            done();
        });
    });

    describe('on Android', function() {
        beforeEach(function() {
            useragent.parse.andReturn({ android: true, platform: 'android' });
        });

        it('should serve android-specific files', function(done) {
            request(phonegap())
            .get('/plugins/org.apache.cordova.dialogs/www/android/notification.js')
            .end(function(e, res) {
                expect(res.statusCode).toEqual(200);
                done();
            });
        });

        // HANGS Jasmine ??
//        it('should serve vdir android device.js', function(done) {
//            chdir('spec/fixture/app-with-platforms', function() {
//                request(phonegap(vopts)).get('/plugins/org.apache.cordova.device/www/device.js').end(function(e, res) {
//                    expect(res.statusCode).toEqual(200);
//                    expect(res.text).toMatch('// Android org.apache.cordova.device.device device.js');
//                    done();
//                });
//            });
//        });
    });

    describe('on iOS', function() {
        beforeEach(function() {
            useragent.parse.andReturn({ ios: true, platform: 'ios' });
        });

        it('should serve ios-specific files', function(done) {
            request(phonegap())
            .get('/plugins/org.apache.cordova.file/www/ios/Entry.js')
            .end(function(e, res) {
                expect(res.statusCode).toEqual(200);
                done();
            });
        });

        // HANGS Jasmine ??
//        it('should serve vdir ios 3.2.0 device.js', function(done) {
//            chdir('spec/fixture/app-with-platforms', function() {
//                request(phonegap(vopts)).get('/plugins/org.apache.cordova.device/www/device.js').end(function(e, res) {
//                    expect(res.statusCode).toEqual(200);
//                    expect(res.text).toMatch('// iOS 3.2.0 org.apache.cordova.device.device device.js');
//                    done();
//                });
//            });
//        });
    });
});


/*!
 * Specification: serve cordova_plugin js
 */

describe('cordova_plugins.js middleware', function() {
    beforeEach(function() {
        spyOn(gaze, 'Gaze').andReturn({ on: function() {} });
        spyOn(useragent, 'parse').andReturn({ ios: true, platform: 'ios' });
    });

    describe('when cordova_plugins.js exists', function (){
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

    describe('when cordova_plugins.js not exists', function (){
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

            it('should serve vdir android cordova.js', function(done) {
                chdir('spec/fixture/app-with-platforms', function() {
                    request(phonegap(vopts)).get('/cordova_plugins.js').end(function(e, res) {
                        expect(res.statusCode).toEqual(200);
                        expect(res.text).toMatch('// platforms/android/assets/www/cordova_plugins.js');
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

            it('should serve vdir ios 2.3.0 cordova_plugins.js', function(done) {
                chdir('spec/fixture/app-with-platforms', function() {
                    request(phonegap(vopts)).get('/cordova_plugins.js').end(function(e, res) {
                        expect(res.statusCode).toEqual(200);
                        expect(res.text).toMatch('// platforms/ios/v3_2_0/www/cordova_plugins.js');
                        done();
                    });
                });
            });
        });
    });
});

