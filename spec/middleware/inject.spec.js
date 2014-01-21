/*!
 * Module dependencies.
 */

var middleware = require('../../lib/middleware'),
    request = require('supertest'),
    chdir = require('chdir');

/*!
 * Specification: inject middleware
 */

describe('inject()', function() {
    it('should inject hammer.js', function(done) {
        chdir('spec/fixture/app-with-cordova', function() {
            request(middleware())
            .get('/')
            .set('accept', 'text/html')
            .end(function(e, res) {
                expect(res.statusCode).toEqual(200);
                expect(res.text).toMatch('Hammer.JS');
                this.app.close();
                done();
            });
        });
    });

    it('should inject homepage logic', function(done) {
        chdir('spec/fixture/app-with-cordova', function() {
            request(middleware())
            .get('/')
            .set('accept', 'text/html')
            .end(function(e, res) {
                expect(res.statusCode).toEqual(200);
                expect(res.text).toMatch('Go to app\'s homepage on a three-finger tap.');
                this.app.close();
                done();
            });
        });
    });

    it('should inject refresh logic', function(done) {
        chdir('spec/fixture/app-with-cordova', function() {
            request(middleware())
            .get('/')
            .set('accept', 'text/html')
            .end(function(e, res) {
                expect(res.statusCode).toEqual(200);
                expect(res.text).toMatch('Refresh the app on a four-finger tap.');
                this.app.close();
                done();
            });
        });
    });
});
