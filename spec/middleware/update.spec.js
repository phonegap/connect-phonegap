/*!
 * Module dependencies.
 */

var admzip = require('adm-zip'),
    archiver = require('archiver'),
    chokidar = require('chokidar'),
    events = require('events'),
    fs = require('fs'),
    path = require('path'),
    phonegap = require('../../lib'),
    request = require('supertest'),
    shell = require('shelljs'),
    url = '/__api__/update',
    watchSpy,
    agent;

/*!
 * Specification: Middleware for /update route
 */

describe('update middleware', function() {
    beforeEach(function() {
        watchSpy = new events.EventEmitter();
        spyOn(chokidar, 'watch').and.returnValue(watchSpy);
        spyOn(process, 'cwd').and.returnValue(path.resolve(__dirname, '../fixture/app-without-cordova'));
        agent = request(phonegap());
    });

    describe('GET /__api__/update', function() {
        it('should generate a zip', function(done) {
            createSpy = jasmine.createSpy('create').and.returnValue({
                on:function() {},
                append:function() {},
                finalize:function() {},
                pipe:function(res) {
                    res.end();
                }
            });
            spyOn(archiver, 'create').and.callFake(createSpy);

            agent.get('/__api__/update').end(function(e, res) {
                expect(createSpy).toHaveBeenCalled();
                done();
            });
        });

        describe('successfully generated zip', function() {
            it('should have a 200 response code', function(done) {
                agent.get('/__api__/update').end(function(e, res) {
                    expect(res.statusCode).toEqual(200);
                    done();
                });
            });

            it('should have application/zip Content-Type', function(done) {
                agent.get('/__api__/update').end(function(e, res) {
                    expect(res.headers['content-type']).toEqual('application/zip');
                    done();
                });
            });

            it('should respond with the zip content', function(done) {
                agent.get('/__api__/update')
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

            it('should respond with only the updated content', function(done) {
                agent.get('/__api__/autoreload').end(function(e, res) {
                    watchSpy.emit('all', 'eventType', path.join(process.cwd(),'www/index.html'));

                    agent.get('/__api__/update')
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
                        var zip = new admzip(res.body);
                        var zipEntry = zip.getEntries();
                        expect(zipEntry.length).toEqual(1);
                        expect(zipEntry[0].entryName).toEqual('www/index.html');
                        done();
                    });
                });
            });
        });
    });
});
