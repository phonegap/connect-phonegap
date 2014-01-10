/*!
 * Module dependencies.
 */

var cordova = require('../../lib/middleware/cordova'),
    request = require('supertest'),
    chdir = require('chdir');


/*!
 * Specification: serve cordovajs
 */

describe('cordova()', function() {
    describe('when cordova.js exists', function (){
        it('should do nothing', function(done) {
            chdir('spec/fixture/app-with-cordova/www', function() {
                request(cordova())
                    .get('/cordova.js')
                    .end(function(e, res) {
                        expect(res.statusCode).toEqual(200);
                        this.app.close();
                        done();
                    });
            });
        });    
    });
    
    describe('when cordova.js not exists', function (){
        it('should serve cordova.js', function(done) {
            chdir('spec/fixture/app-without-cordova/www', function() {
                request(cordova())
                    .get('/cordova.js')
                    .end(function(e, res) {
                        expect(res.statusCode).toEqual(200);
                        this.app.close();
                        done();
                    });
            });
        });        
    });
});