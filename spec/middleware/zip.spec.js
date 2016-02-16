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
    checksum = require('checksum'),
    AdmZip = require('adm-zip'),
    url = '/__api__/appzip';

/*!
 * Specification: Middleware for /zip route
 */

describe('zip middleware', function() {

    function setApp(app) {
        spyOn(process, 'cwd').andReturn(path.resolve(__dirname, '../fixture/' + app));
    }

    beforeEach(function() {
        spyOn(gaze, 'Gaze').andReturn({ on: function() {} });
    });

    describe('GET /__api__/appzip', function() {
        it('should generate a zip', function(done) {
            setApp('app-without-cordova');
            createSpy = jasmine.createSpy('create');
            spyOn(archiver, 'create').andCallFake(createSpy);

            request(phonegap())
            .get('/__api__/appzip')
            .end(function(e, res) {
                expect(createSpy).toHaveBeenCalled();
                done();
            });
        });

        it('should zip files for app with symlinks', function(done) {
            setApp('app-with-symlinks');

            request(phonegap())
            .get('/__api__/appzip')
            .parse(function(res, callback) {
                res.setEncoding('binary');
                res.data = '';
                res.on('data', function(chunk) {
                    res.data += chunk;
                });
                res.on('end', function() {
                    callback(null, new Buffer(res.data, 'binary'));
                });
            })
            .end(function(e, res) {
                var zip = new AdmZip(res.body);
                expect(zip.getEntries().length).toEqual(5);
                expect(zip.readFile('www/index.html').length).toBeGreaterThan(0);
                var jsFiles = ['cordova.js', 'cordova_plugins.js', 'phonegap.js'];
                for (var i = 0; i < jsFiles.length; i++) {
                    var file = jsFiles[i];
                    var expectedChecksum = checksum(fs.readFileSync(path.resolve(__dirname, '../fixture/app-with-symlinks/dist/' + file)));
                    var actualChecksum = checksum(zip.readFile('www/' + file));
                    expect(actualChecksum).toEqual(expectedChecksum);
                }
                expect(checksum(zip.readFile('www/assets/icon-40.png'))).toEqual(
                    checksum(fs.readFileSync(path.resolve(__dirname, '../fixture/images/icon-40.png')))
                );
                done();
            });
        });

        describe('content-security-policy', function() {
            describe('when missing', function() {
                it('should be added to support unsafe scripts', function(done) {
                    setApp('app-with-cordova');

                    request(phonegap())
                    .get('/__api__/appzip')
                    .parse(function(res, callback) {
                        res.setEncoding('binary');
                        res.data = '';
                        res.on('data', function(chunk) {
                            res.data += chunk;
                        });
                        res.on('end', function() {
                            callback(null, new Buffer(res.data, 'binary'));
                        });
                    })
                    .end(function(e, res) {
                        var zip = new AdmZip(res.body);
                        var content = zip.readFile('www/index.html').toString('utf-8');
                        expect(content).toMatch(
                            /<meta.+content-security-policy.+script-src \* 'unsafe-inline'.+>/i
                        );
                        done();
                    });
                });
            });

            describe('when exists', function() {
                it('should be update to support unsafe scripts', function(done) {
                    setApp('app-with-csp');

                    request(phonegap())
                    .get('/__api__/appzip')
                    .parse(function(res, callback) {
                        res.setEncoding('binary');
                        res.data = '';
                        res.on('data', function(chunk) {
                            res.data += chunk;
                        });
                        res.on('end', function() {
                            callback(null, new Buffer(res.data, 'binary'));
                        });
                    })
                    .end(function(e, res) {
                        var zip = new AdmZip(res.body);
                        var content = zip.readFile('www/index.html').toString('utf-8');
                        expect(content).toMatch(
                            /<meta.+content-security-policy.+script-src \* 'unsafe-inline'.+>/i
                        );
                        done();
                    });
                });
            });
        });

        describe('successfully generated zip', function() {
            it('should have a 200 response code', function(done) {
                setApp('app-without-cordova');
                request(phonegap())
                .get('/__api__/appzip')
                .end(function(e, res) {
                    expect(res.statusCode).toEqual(200);
                    done();
                });
            });

            it('should have application/zip Content-Type', function(done) {
                setApp('app-without-cordova');
                request(phonegap())
                .get('/__api__/appzip')
                .end(function(e, res) {
                    expect(res.headers['content-type']).toEqual('application/zip');
                    done();
                });
            });

            it('should respond with the zip content', function(done) {
                setApp('app-without-cordova');
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
                setApp('app-without-cordova');
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
