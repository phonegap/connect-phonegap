/*!
 * Module dependencies.
 */

var middleware = require('../../lib/middleware'),
    request = require('supertest'),
    chdir = require('chdir');

/*!
 * Specification: plugins middleware
 */

describe('plugins()', function() {
    it('should load a plugin given a valid path', function(done) {
        request(middleware())
        .get('/plugins/org.apache.cordova.file/www/DirectoryEntry.js')
        .end(function(e, res) {
            expect(res.statusCode).toEqual(200);
            expect(res.text).toMatch(' * An interface representing a directory on the file system.');
            this.app.close();
            done();
        });
    });
});
