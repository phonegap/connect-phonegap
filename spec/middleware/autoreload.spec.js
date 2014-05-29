/*!
 * Module dependencies.
 */

var chdir = require('chdir'),
    events = require('events'),
    gaze = require('gaze'),
    http = require('http'),
    phonegap = require('../../lib'),
    request = require('supertest'),
    options,
    watchSpy;

/*!
 * Specification: AutoReload middleware.
 */

describe('autoreload middleware', function() {
    beforeEach(function() {
        watchSpy = new events.EventEmitter();
        spyOn(gaze, 'Gaze').andReturn(watchSpy);
    });

    describe('options', function() {
        describe('autoreload', function() {
            it('should be enabled by default', function() {
                phonegap();
                expect(gaze.Gaze).toHaveBeenCalled();
            });

            it('should be enabled when true', function() {
                phonegap({ autoreload: true });
                expect(gaze.Gaze).toHaveBeenCalled();
            });

            it('should be disabled when false', function() {
                phonegap({ autoreload: false });
                expect(gaze.Gaze).not.toHaveBeenCalled();
            });
        });
    });

    describe('phonegap.serve', function() {
        beforeEach(function() {
            spyOn(http, 'createServer').andReturn({
                on: function() {},
                listen: function() {}
            });
        });

        it('should pass the autoreload option', function() {
            phonegap.serve({ autoreload: true });
            expect(gaze.Gaze).toHaveBeenCalled();
        });
    });

    describe('when up-to-date', function() {
        describe('GET /__api__/autoreload', function() {
            it('should return false', function(done) {
                chdir('spec/fixture/app-with-cordova', function() {
                    var agent = request.agent(phonegap());
                    agent.get('/index.html').end(function(e, res) {
                        agent.get('/__api__/autoreload').end(function(e, res) {
                            expect(res.statusCode).toEqual(200);
                            expect(JSON.parse(res.text).outdated).toMatch(false);
                            done();
                        });
                    });
                });
            });
        });

        describe('POST /__api__/autoreload', function() {
            it('should return false', function(done) {
                chdir('spec/fixture/app-with-cordova', function() {
                    request(phonegap())
                    .post('/__api__/autoreload')
                    .end(function(e, res) {
                        expect(res.statusCode).toEqual(200);
                        expect(JSON.parse(res.text).outdated).toMatch(false);
                        done();
                    });
                });
            });
        });
    });

    describe('when outdated', function() {
        beforeEach(function() {
            gaze.Gaze.andCallFake(function() {
                process.nextTick(function() {
                    watchSpy.emit('all', 'eventType', '/path/to/file.js');
                });
                return watchSpy;
            });
        });

        it('should emit log event', function(done) {
            chdir('spec/fixture/app-with-cordova', function() {
                var pg = phonegap().on('log', function() {
                    expect(arguments[1]).toMatch('/path/to/file.js');
                    done();
                });
                request(pg)
                .post('/__api__/autoreload')
                .end(function(e, res) {
                });
            });
        });

        describe('GET /__api__/autoreload', function() {
            it('should return true', function(done) {
                chdir('spec/fixture/app-with-cordova', function() {
                    request(phonegap())
                    .get('/__api__/autoreload')
                    .end(function(e, res) {
                        expect(res.statusCode).toEqual(200);
                        expect(JSON.parse(res.text).outdated).toMatch(true);
                        done();
                    });
                });
            });
        });

        describe('POST /__api__/autoreload', function() {
            it('should return false', function(done) {
                chdir('spec/fixture/app-with-cordova', function() {
                    request(phonegap())
                    .post('/__api__/autoreload')
                    .end(function(e, res) {
                        expect(res.statusCode).toEqual(200);
                        expect(JSON.parse(res.text).outdated).toMatch(false);
                        done();
                    });
                });
            });
        });
    });

    describe('with multiple devices', function() {
        it('should keep the outdated states independent', function(done) {
            chdir('spec/fixture/app-with-cordova', function() {
                var server = phonegap(),
                    agent1 = request.agent(server),
                    agent2 = request.agent(server);

                // agent1 make a request and is up-to-date
                agent1.get('/index.html').end(function(e, res) {
                    agent1.get('/__api__/autoreload').end(function(e, res) {
                        expect(JSON.parse(res.text).outdated).toEqual(false);
                        // agent2 has not made a request and is outdated
                        agent2.get('/__api__/autoreload').end(function(e, res) {
                            expect(JSON.parse(res.text).outdated).toEqual(true);
                            // now let agent2 make a request and become up-to-date
                            agent2.get('/index.html').end(function(e, res) {
                                agent2.get('/__api__/autoreload').end(function(e, res) {
                                    expect(JSON.parse(res.text).outdated).toEqual(false);
                                    done();
                                });
                            });
                        });
                    });
                });
            });
        });
    });
});
