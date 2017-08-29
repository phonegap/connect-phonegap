/*!
 * Module dependencies.
 */

var chdir = require('chdir'),
    chokidar = require('chokidar'),
    phonegap = require('../../lib'),
    request = require('supertest');

/*!
 * Specification: inject middleware
 * note: these tests run like they are on the browser
 */

describe('inject middleware', function() {
    beforeEach(function() {
        spyOn(chokidar, 'watch').and.returnValue({ on: function() {} });
    });

    it('should not inject hammer.js', function(done) {
        chdir('spec/fixture/app-with-cordova', function() {
            request(phonegap())
            .get('/')
            .set('accept', 'text/html')
            .end(function(e, res) {
                expect(res.statusCode).toEqual(200);
                expect(res.text).not.toMatch('Hammer.JS');
                done();
            });
        });
    });

    it('should not inject homepage logic', function(done) {
        chdir('spec/fixture/app-with-cordova', function() {
            request(phonegap({ homepage: true }))
            .get('/')
            .set('accept', 'text/html')
            .end(function(e, res) {
                expect(res.statusCode).toEqual(200);
                expect(res.text).not.toMatch('Go to app\'s homepage on a three-finger tap.');
                done();
            });
        });
    });

    it('should not inject refresh logic', function(done) {
        chdir('spec/fixture/app-with-cordova', function() {
            request(phonegap({ refresh: true }))
            .get('/')
            .set('accept', 'text/html')
            .end(function(e, res) {
                expect(res.statusCode).toEqual(200);
                expect(res.text).not.toMatch('Refresh the app on a four-finger tap.');
                done();
            });
        });
    });

    describe('when autoreload is enabled', function() {
        it('should inject autoreload logic', function(done) {
            chdir('spec/fixture/app-with-cordova', function() {
                request(phonegap({ autoreload: true }))
                .get('/')
                .set('accept', 'text/html')
                .end(function(e, res) {
                    expect(res.statusCode).toEqual(200);
                    expect(res.text).toMatch('// Reload');
                    done();
                });
            });
        });
    });

    describe('when autoreload is disabled', function() {
        it('should not inject autoreload logic', function(done) {
            chdir('spec/fixture/app-with-cordova', function() {
                request(phonegap({ autoreload: false }))
                .get('/')
                .set('accept', 'text/html')
                .end(function(e, res) {
                    expect(res.statusCode).toEqual(200);
                    expect(res.text).not.toMatch('// Reload');
                    done();
                });
            });
        });
    });

    it('should inject proxy logic', function(done) {
        chdir('spec/fixture/app-with-cordova', function() {
            request(phonegap({ proxy: true }))
            .get('/')
            .set('accept', 'text/html')
            .end(function(e, res) {
                expect(res.statusCode).toEqual(200);
                expect(res.text).toMatch('// Proxy');
                done();
            });
        });
    });

    it('should inject push logic', function(done) {
        chdir('spec/fixture/app-with-cordova', function() {
            request(phonegap({ push: true }))
            .get('/')
            .set('accept', 'text/html')
            .end(function(e, res) {
                expect(res.statusCode).toEqual(200);
                expect(res.text).toMatch('// Push');
                done();
            });
        });
    });

    it('should inject console logic', function(done) {
        chdir('spec/fixture/app-with-cordova', function() {
            request(phonegap({ console: true }))
            .get('/')
            .set('accept', 'text/html')
            .end(function(e, res) {
                expect(res.statusCode).toEqual(200);
                expect(res.text).toMatch('window.console');
                done();
            });
        });
    });
});
