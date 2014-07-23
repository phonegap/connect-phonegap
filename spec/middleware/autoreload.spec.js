/*!
 * Module dependencies.
 */

var chdir = require('chdir'),
    events = require('events'),
    gaze = require('gaze'),
    http = require('http'),
    phonegap = require('../../lib'),
    request = require('supertest'),
    io = require('socket.io'),
    agent,
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
                listen: function() {},
                listeners:function(){return []},
                removeAllListeners:function(){}
            });
        });

        it('should pass the autoreload option', function() {
            phonegap.serve({ autoreload: true });
            expect(gaze.Gaze).toHaveBeenCalled();
        });
    });

    describe('default state', function() {
        beforeEach(function() {
            agent = request.agent(phonegap());
        });

        it('should be out-of-date', function(done) {
            chdir('spec/fixture/app-with-cordova', function() {
                agent.get('/__api__/autoreload').end(function(e, res) {
                    expect(res.statusCode).toEqual(200);
                    expect(JSON.parse(res.text).content.outdated).toMatch(true);
                    done();
                });
            });
        });

        describe('after a resource request', function() {
            beforeEach(function(done) {
                chdir('spec/fixture/app-with-cordova', function() {
                    agent.get('/index.html').end(function(e, res) {
                        done();
                    });
                });
            });

            it('should be up-to-date', function(done) {
                chdir('spec/fixture/app-with-cordova', function() {
                    agent.get('/__api__/autoreload').end(function(e, res) {
                        expect(res.statusCode).toEqual(200);
                        expect(JSON.parse(res.text).content.outdated).toMatch(false);
                        done();
                    });
                });
            });
        });
    });

    describe('when up-to-date', function() {
        beforeEach(function(done) {
            // tell the API that we're up-to-date
            agent = request.agent(phonegap());
            agent.post('/__api__/autoreload').end(function(e, res) {
                done();
            });
        });

        describe('GET /__api__/autoreload', function() {
            it('should return false', function(done) {
                chdir('spec/fixture/app-with-cordova', function() {
                    agent.get('/index.html').end(function(e, res) {
                        agent.get('/__api__/autoreload').end(function(e, res) {
                            expect(res.statusCode).toEqual(200);
                            expect(JSON.parse(res.text).content.outdated).toMatch(false);
                            done();
                        });
                    });
                });
            });
        });

        describe('POST /__api__/autoreload', function() {
            it('should return false', function(done) {
                chdir('spec/fixture/app-with-cordova', function() {
                    agent.post('/__api__/autoreload')
                    .end(function(e, res) {
                        expect(res.statusCode).toEqual(200);
                        expect(JSON.parse(res.text).content.outdated).toMatch(false);
                        done();
                    });
                });
            });
        });
    });

    describe('when out-of-date', function() {
        beforeEach(function() {
            agent = request.agent(phonegap());
            gaze.Gaze.andCallFake(function() {
                process.nextTick(function() {
                    watchSpy.emit('all', 'eventType', '/path/to/file.js');
                });
                return watchSpy;
            });
        });

        describe('GET /__api__/autoreload', function() {
            it('should return true', function(done) {
                chdir('spec/fixture/app-with-cordova', function() {
                    agent.get('/__api__/autoreload').end(function(e, res) {
                        expect(res.statusCode).toEqual(200);
                        expect(JSON.parse(res.text).content.outdated).toMatch(true);
                        done();
                    });
                });
            });
        });

        describe('POST /__api__/autoreload', function() {
            it('should return false', function(done) {
                chdir('spec/fixture/app-with-cordova', function() {
                    agent.post('/__api__/autoreload').end(function(e, res) {
                        expect(res.statusCode).toEqual(200);
                        expect(JSON.parse(res.text).content.outdated).toMatch(false);
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

                // agent1 make a request and reports up-to-date
                agent1.post('/__api__/autoreload').end(function(e, res) {
                    agent1.get('/__api__/autoreload').end(function(e, res) {
                        expect(JSON.parse(res.text).content.outdated).toEqual(false);
                        // agent2 makes no request and reports out-of-date
                        agent2.get('/__api__/autoreload').end(function(e, res) {
                            expect(JSON.parse(res.text).content.outdated).toEqual(true);
                            // agent2 makes request and becomes up-to-date
                            agent2.post('/__api__/autoreload').end(function(e, res) {
                                agent2.get('/__api__/autoreload').end(function(e, res) {
                                    expect(JSON.parse(res.text).content.outdated).toEqual(false);
                                    done();
                                });
                            });
                        });
                    });
                });
            });
        });
    });

    describe('log changed files', function() {
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
                // gaze will trigger the log event
                var server = phonegap().on('log', function() {
                    expect(arguments[1]).toMatch('/path/to/file.js');
                    done();
                });
            });
        });
    });

});
