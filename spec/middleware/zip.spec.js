/*!
 * Module dependencies.
 */

var events = require('events'),
    fs = require('fs'),
    archiver = require('archiver'),
    gaze = require('gaze'),
    path = require('path'),
    phonegap = require('../../lib'),
    request = require('supertest'),
    shell = require('shelljs'),
    zip = require('../../lib/middleware/zip'),
    url = '/__api__/appzip';

/*!
 * Specification: Middleware for /zip route
 */

describe('zip middleware', function() {
    beforeEach(function() {
        spyOn(gaze, 'Gaze').andReturn({ on: function() {} });
        spyOn(process, 'cwd').andReturn(path.resolve(__dirname, '../fixture/app-without-cordova'));
    });

    describe('GET /__api__/appzip', function() {
        it('should generate a zip', function(done) {
            createSpy = jasmine.createSpy('create');
            spyOn(archiver, 'create').andCallFake(createSpy);

            request(phonegap())
            .get('/__api__/appzip')
            .end(function(e, res) {
                expect(createSpy).toHaveBeenCalled();
                done();
            });
        });
    
        describe('successfully generated zip', function() {
            it('should have a 200 response code', function(done) {
                request(phonegap())
                .get('/__api__/appzip')
                .end(function(e, res) {
                    expect(res.statusCode).toEqual(200);
                    done();
                });
            });

            it('should have application/zip Content-Type', function(done) {
                request(phonegap())
                .get('/__api__/appzip')
                .end(function(e, res) {
                    expect(res.headers['content-type']).toEqual('application/zip');
                    done();
                });
            });

            it('should respond with the zip content', function(done) {
                request(phonegap())
                .get('/__api__/appzip')
                // custom application/zip parser for supertest
                .parse(function(res, callback) {
                    res.setEncoding('binary');
                    res.data = '';
                    res.on('data', function (chunk) {
                        res.data += chunk;
                    });
                    res.on('end', function () {
                        callback(null, new Buffer(res.data, 'binary'));
                    });
                })
                .end(function(e, res) {
                    expect(Buffer.isBuffer(res.body)).toBe(true);
                    expect(res.body.length).toBeGreaterThan(0);
                    done();
                });
            });
        });

        describe('failed to generate zip', function() {
            beforeEach(function() {
                spyOn(archiver, 'create').andCallFake(function() {
                    throw new Error();
                });
            });

            it('should have a 500 response code', function(done) {
                request(phonegap())
                .get('/__api__/appzip')
                .end(function(e, res) {
                    expect(res.statusCode).toEqual(500);
                    done();
                });
            });
        });

    });

});
