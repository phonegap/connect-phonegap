/*!
 * Module dependencies.
 */

var admzip = require('adm-zip'),
    events = require('events'),
    fs = require('fs'),
    gaze = require('gaze'),
    path = require('path'),
    phonegap = require('../../lib'),
    request = require('supertest'),
    shell = require('shelljs'),
    zip = require('../../lib/middleware/zip'),
    url = '/__api__/update',
    watchSpy,
    agent;

/*!
 * Specification: Middleware for /update route
 */

describe('update middleware', function() {
    beforeEach(function() {
        watchSpy = new events.EventEmitter();
        spyOn(gaze, 'Gaze').andReturn(watchSpy);
        spyOn(process, 'cwd').andReturn(path.resolve(__dirname, '../fixture/app-without-cordova'));
        agent = request(phonegap());
    });

    describe('GET /__api__/update', function() {

        describe('successfully generated zip', function() {
            beforeEach(function() {
                update = require('../../lib/middleware/update');
                archive = update.archiver();
                agent = request.agent(phonegap());
            });

            it('should respond with only the updated content', function(done) {
                agent.get('/__api__/update').end(function(e, res) {
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

        describe('failed to generate zip', function() {

        });
    });

});
