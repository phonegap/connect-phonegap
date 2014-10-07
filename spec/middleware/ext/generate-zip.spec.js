/*!
 * Module dependencies.
 */

var chdir = require('chdir'),
    fs = require('fs'),
    generateZip = require('../../../lib/middleware/ext/generate-zip'),
    shell = require('shelljs'),
    os = require('os'),
    options;

/*!
 * Specification: Generate Zip Archive
 */

describe('generateZip.archive(options, callback)', function() {
    beforeEach(function() {
        options = {
            emitter: {
                emit: function() {}
            },
            req: {
                sessionID: 'abc123',
                headers: {
                    host: '192.168.0.1:3000'
                }
            }
        };
    });

    it('should require options.emitter', function() {
        expect(function() {
            options.emitter = undefined;
            generateZip.archive(options, function() {});
        }).toThrow();
    });

    it('should require options.req', function() {
        expect(function() {
            options.req = undefined;
            generateZip.archive(options, function() {});
        }).toThrow();
    });

    describe('when a cordova project', function() {
        beforeEach(function() {
            chdir.push();
            process.chdir('spec/fixture/app-without-cordova');
        });
        afterEach(function() {
            chdir.pop();
        });

        it('should archive the app as a zip file', function(done) {
            generateZip.archive(options, function(e, data) {
                expect(e).toBeNull();
                expect(data).toEqual(jasmine.any(Object));
                expect(fs.existsSync(data.zipPath)).toBe(true);
                cleanup(data, done);
            });
        });
    });

    describe('when not a cordova project', function() {
        it('should trigger error callback', function(done) {
            generateZip.archive(options, function(e, data) {
                expect(e).toEqual(jasmine.any(Error));
                done();
            });
        });
    });
});

/*!
 * Helper functions.
 */

function cleanup(data, callback) {
    // precaution to not delete someting important
    if (data.tmpPath.indexOf(os.tmpdir()) >= 0) {
        shell.rm('-rf', data.tmpPath);
    }
    else {
        console.error('did not clean up:', data.tmpPath);
    }

    callback();
}
