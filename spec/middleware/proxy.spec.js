/*!
 * Module dependencies.
 */

var chdir = require('chdir'),
    gaze = require('gaze'),
    phonegap = require('../../lib'),
    request = require('supertest');

/*!
 * Specification: Proxy middleware.
 */

describe('proxy middleware', function() {
    beforeEach(function() {
        spyOn(gaze, 'Gaze').andReturn({ on: function() {} });
    });

    describe('single-origin request', function() {
        it('should be served normally', function(done) {
            chdir('spec/fixture/app-with-cordova', function() {
                request(phonegap())
                .get('/cordova.js')
                .end(function(e, res) {
                    expect(res.statusCode).toEqual(200);
                    expect(res.text).toMatch('i am cordova');
                    this.app.close();
                    done();
                });
            });
        });
    });

    //
    // better to mock the requests but this is awkward with request lib.
    //
    describe('cross-origin request', function() {
        it('should proxy http:', function(done) {
            chdir('spec/fixture/app-with-cordova', function() {
                request(phonegap())
                .get('/proxy/http%3A%2F%2Fphonegap.com')
                .end(function(e, res) {
                    expect(res.statusCode).toEqual(200);
                    expect(res.text).toMatch('PhoneGap');
                    this.app.close();
                    done();
                });
            });
        });

        it('should proxy https:', function(done) {
            chdir('spec/fixture/app-with-cordova', function() {
                request(phonegap())
                .get('/proxy/https%3A%2F%2Fajax.googleapis.com%2Fajax%2Fservices%2Fsearch%2Fweb%3Fv%3D1.0%26q%3DAdobe%2520PhoneGap')
                .end(function(e, res) {
                    expect(res.statusCode).toEqual(200);
                    expect(res.text).toMatch('GsearchResultClass');
                    this.app.close();
                    done();
                });
            });
        });
    });
});
