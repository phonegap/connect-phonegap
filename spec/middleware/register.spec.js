/*!
 * Module dependencies.
 */

var chdir = require('chdir'),
    chokidar = require('chokidar'),
    phonegap = require('../../lib'),
    request = require('supertest'),
    url = '/__api__/register',
    data;

/*!
 * Specification: Register device middleware.
 */

describe('register middleware', function() {
    beforeEach(function() {
        spyOn(chokidar, 'watch').and.returnValue({ on: function() {} });
        data = { platform: 'Android', version: '3.4.0' };
    });

    describe('POST /__api__/register', function() {
        describe('missing all parameters', function() {
            it('should return an error', function(done) {
                data = {};
                request(phonegap())
                .post(url)
                .send(data)
                .end(function(e, res) {
                    expect(res.statusCode).toEqual(200);
                    expect(JSON.parse(res.text).error).toEqual(jasmine.any(String));
                    done();
                });
            });
        });

        describe('missing parameter "platform"', function() {
            it('should return an error', function(done) {
                delete data.platform;
                request(phonegap())
                .post(url)
                .send(data)
                .end(function(e, res) {
                    expect(res.statusCode).toEqual(200);
                    expect(JSON.parse(res.text).error).toEqual(jasmine.any(String));
                    done();
                });
            });
        });

        describe('missing parameter "version"', function() {
            it('should return an error', function(done) {
                delete data.version;
                request(phonegap())
                .post(url)
                .send(data)
                .end(function(e, res) {
                    expect(res.statusCode).toEqual(200);
                    expect(JSON.parse(res.text).error).toEqual(jasmine.any(String));
                    done();
                });
            });
        });

        describe('successfully register device', function() {
            it('should not return an error', function(done) {
                request(phonegap())
                .post(url)
                .send(data)
                .end(function(e, res) {
                    expect(res.statusCode).toEqual(200);
                    expect(JSON.parse(res.text).error).not.toBeDefined();
                    done();
                });
            });

            it('should return current registered device', function(done) {
                request(phonegap())
                .post(url)
                .send(data)
                .end(function(e, res) {
                    expect(res.statusCode).toEqual(200);
                    expect(JSON.parse(res.text).current).toEqual({
                        platform: 'android',
                        version: '3.4.0'
                    });
                    done();
                });
            });

            it('should return available platforms', function(done) {
                request(phonegap())
                .post(url)
                .send(data)
                .end(function(e, res) {
                    expect(res.statusCode).toEqual(200);
                    expect(JSON.parse(res.text).available).toEqual(jasmine.any(Object));
                    done();
                });
            });
        });

        describe('failure registering device', function() {
            beforeEach(function() {
                data.version = '0.9.4'; // version is not supported
            });

            it('should return an error', function(done) {
                request(phonegap())
                .post(url)
                .send(data)
                .end(function(e, res) {
                    expect(res.statusCode).toEqual(200);
                    expect(JSON.parse(res.text).error).toEqual(jasmine.any(String));
                    done();
                });
            });

            it('should return current registered device', function(done) {
                request(phonegap())
                .post(url)
                .send(data)
                .end(function(e, res) {
                    expect(res.statusCode).toEqual(200);
                    expect(JSON.parse(res.text).current).not.toEqual({
                        platform: data.platform,
                        version: data.version
                    });
                    done();
                });
            });

            it('should return available platforms', function(done) {
                request(phonegap())
                .post(url)
                .send(data)
                .end(function(e, res) {
                    expect(res.statusCode).toEqual(200);
                    expect(JSON.parse(res.text).available).toEqual(jasmine.any(Object));
                    done();
                });
            });
        });
    });
});
