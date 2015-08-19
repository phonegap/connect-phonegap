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
    url = '/__api__/update',
    agent,
    watchSpy,
    update,
    archive,
    testPath = path.resolve(__dirname, '../fixture/app-without-cordova');

/*!
 * Specification: Middleware for /update route
 */

describe('update middleware', function() {
    beforeEach(function() {
        watchSpy = new events.EventEmitter();
        spyOn(gaze, 'Gaze').andReturn(watchSpy);
        spyOn(process, 'cwd').andReturn(testPath);
    });

    describe('GET /__api__/update', function() {

        describe('successfully generated zip', function() {
            beforeEach(function() {
                update = require('../../lib/middleware/update');
                archive = update.archiver();
                agent = request.agent(phonegap());
            });

            it('should respond with only the updated content', function(done) {
                spyOn(archive, 'append').andCallThrough();

                agent.get('/__api__/autoreload').end(function(e, res) {
                    watchSpy.emit('all', 'eventType', path.join(process.cwd(),'www/index.html'));

                    agent.get('/__api__/update').end(function(e, res) {
                        expect(archive.append).toHaveBeenCalled();
                        expect(archive.append).toHaveBeenCalledWith(jasmine.any(Object), jasmine.objectContaining({ name: 'www/index.html' }));
                        done();
                    });
                });
            });
        });
    });

});
