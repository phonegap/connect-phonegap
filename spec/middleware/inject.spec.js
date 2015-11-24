/*!
 * Module dependencies.
 */

var chdir = require('chdir'),
    gaze = require('gaze'),
    phonegap = require('../../lib'),
    request = require('supertest');

/*!
 * Specification: inject middleware
 */

describe('inject middleware', function() {
    beforeEach(function() {
        spyOn(gaze, 'Gaze').andReturn({ on: function() {} });
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

    it('should inject homepage logic', function(done) {
        chdir('spec/fixture/app-with-cordova', function() {
            request(phonegap())
            .get('/')
            .set('accept', 'text/html')
            .end(function(e, res) {
                expect(res.statusCode).toEqual(200);
                expect(res.text).toMatch('Go to app\'s homepage on a three-finger tap.');
                done();
            });
        });
    });

    it('should inject refresh logic', function(done) {
        chdir('spec/fixture/app-with-cordova', function() {
            request(phonegap())
            .get('/')
            .set('accept', 'text/html')
            .end(function(e, res) {
                expect(res.statusCode).toEqual(200);
                expect(res.text).toMatch('Refresh the app on a four-finger tap.');
                done();
            });
        });
    });

    describe('when autoreload is enabled', function() {
        it('should inject autoreload logic', function(done) {
            chdir('spec/fixture/app-with-cordova', function() {
                request(phonegap())
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

    describe('when autoreload is diabled', function() {
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
            request(phonegap())
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
            request(phonegap())
            .get('/')
            .set('accept', 'text/html')
            .end(function(e, res) {
                expect(res.statusCode).toEqual(200);
                expect(res.text).toMatch('// Push');
                done();
            });
        });
    });
});
