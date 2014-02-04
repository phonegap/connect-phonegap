/*!
 * Module dependencies.
 */

var chdir = require('chdir'),
    middleware = require('../../lib/middleware'),
    request = require('supertest'),
    useragent = require('../../lib/middleware/ext/useragent');

/*!
 * Specification: plugins middleware
 */

describe('plugins()', function() {
    beforeEach(function() {
        spyOn(useragent, 'parse').andReturn({ ios: true, platform: 'ios' });
    });

    it('should load a plugin given a valid path', function(done) {
        request(middleware())
        .get('/plugins/org.apache.cordova.file/www/DirectoryEntry.js')
        .end(function(e, res) {
            expect(res.statusCode).toEqual(200);
            expect(res.text).toMatch(' * An interface representing a directory on the file system.');
            this.app.close();
            done();
        });
    });

    describe('on Android', function() {
        beforeEach(function() {
            useragent.parse.andReturn({ android: true, platform: 'android' });
        });

        it('should serve android-specific files', function(done) {
            request(middleware())
            .get('/plugins/org.apache.cordova.dialogs/www/android/notification.js')
            .end(function(e, res) {
                expect(res.statusCode).toEqual(200);
                this.app.close();
                done();
            });
        });
    });

    describe('on iOS', function() {
        beforeEach(function() {
            useragent.parse.andReturn({ ios: true, platform: 'ios' });
        });

        it('should serve ios-specific files', function(done) {
            request(middleware())
            .get('/plugins/org.apache.cordova.file/www/ios/Entry.js')
            .end(function(e, res) {
                expect(res.statusCode).toEqual(200);
                this.app.close();
                done();
            });
        });
    });
});
