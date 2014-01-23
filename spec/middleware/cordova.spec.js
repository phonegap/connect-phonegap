/*!
 * Module dependencies.
 */

var soundwave = require('../../lib'),
    chdir = require('chdir'),
    gaze = require('gaze'),
    request = require('supertest');

/*!
 * Specification: serve cordovajs
 */

describe('cordova()', function() {
    beforeEach(function() {
        spyOn(gaze, 'Gaze').andReturn({ on: function() {} });
    });

    describe('when cordova.js exists', function (){
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

    describe('when cordova.js not exists', function (){
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
