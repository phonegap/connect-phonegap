/*!
 * Module dependencies.
 */

var events = require('events'),
    fs = require('fs'),
    gaze = require('gaze'),
    path = require('path'),
    phonegap = require('../../lib'),
    request = require('supertest'),
    shell = require('shelljs'),
    zip = require('../../lib/middleware/zip'),
    url = '/__api__/zip';

/*!
 * Specification: Middleware for /zip route
 */

describe('zip middleware', function() {
    beforeEach(function() {
        spyOn(gaze, 'Gaze').andReturn({ on: function() {} });
        spyOn(zip, 'archive').andCallFake(function(options, callback){
            callback(null, {
                zipPath: path.resolve(__dirname, '../fixture/app.zip'),
                appPath: path.resolve(__dirname, '../fixture/app-without-cordova')
            });
        });
        spyOn(shell, 'rm');
    });

    describe('GET /__api__/zip', function() {
        it('should generate the zip', function(done) {
            request(phonegap())
            .get('/__api__/zip')
            .end(function(e, res) {
                expect(zip.archive).toHaveBeenCalled();
                done();
            });
        });

        describe('successfully generated zip', function() {
            it('should have a 200 response code', function(done) {
                request(phonegap())
                .get('/__api__/zip')
                .end(function(e, res) {
                    expect(res.statusCode).toEqual(200);
                    done();
                });
            });

            it('should have application/zip Content-Type', function(done) {
                request(phonegap())
                .get('/__api__/zip')
                .end(function(e, res) {
                    expect(res.headers['content-type']).toEqual('application/zip');
                    done();
                });
            });

            it('should respond with the zip content', function(done) {
                request(phonegap())
                .get('/__api__/zip')
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
                zip.archive.andCallFake(function(options, callback){
                    callback(new Error('failed to generate zip'));
                });
            });

            it('should have a 404 response code', function(done) {
                request(phonegap())
                .get('/__api__/zip')
                .end(function(e, res) {
                    expect(res.statusCode).toEqual(404);
                    done();
                });
            });
        });
    });
});
