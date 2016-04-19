
/*!
 * Module dependencies.
 */

var chdir = require('chdir'),
    gaze = require('gaze'),
    phonegap = require('../../lib'),
    request = require('supertest'),
    url = '/__api__/devices',
    data;

/*!
 * Specification: Register device middleware.
 */

describe('register middleware', function() {
    beforeEach(function() {
        spyOn(gaze, 'Gaze').andReturn({ on: function() {} });
        data = { platform: 'Android', version: '3.4.0' };
    });

    describe('GET /__api__/devices', function() {
        describe('no connected devices', function() {
            it('should return an empty array', function(done) {
                data = {};
                request(phonegap())
                .get(url)
                .end(function(e, res) {
                    expect(res.statusCode).toEqual(200);
                    //expect(JSON.parse(res.text).error).toEqual(jasmine.any(String));
                    done();
                });
            });
        });
        describe('connected devices', function() {
            it('should return list of devices', function(done) {
                data = {};
                request(phonegap())
                .get(url)
                .end(function(e, res) {
                    expect(res.statusCode).toEqual(200);
                    //expect(JSON.parse(res.text).error).toEqual(jasmine.any(String));
                    done();
                });
            });
        });

    });

});
