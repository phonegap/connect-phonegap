/*!
 * Module dependencies.
 */

var soundwave = require('../../lib'),
    chdir = require('chdir'),
    gaze = require('gaze'),
    request = require('supertest');

/*!
 * Specification: serve cordova_plugin js
 */

describe('cordova_plugins()', function() {
    beforeEach(function() {
        spyOn(gaze, 'Gaze').andReturn({ on: function() {} });
    });

    describe('when cordova_plugins.js exists', function (){
        it('should do nothing', function(done) {
            chdir('spec/fixture/app-with-cordova', function() {
                request(soundwave()).get('/cordova_plugins.js').end(function(e, res) {
                    expect(res.statusCode).toEqual(200);
                    expect(res.text).toMatch('i am cordova plugins');
                    this.app.close();
                    done();
                });
            });
        });
    });

    describe('when cordova_plugins.js not exists', function (){
        it('should serve cordova_plugins.js', function(done) {
            chdir('spec/fixture/app-without-cordova', function() {
                request(soundwave()).get('/cordova_plugins.js').end(function(e, res) {
                    expect(res.statusCode).toEqual(200);
                    expect(res.text).toMatch('cordova.define');
                    this.app.close();
                    done();
                });
            });
        });
    });
});
