/*!
 * Module dependencies.
 */

var soundwave = require('../lib'),
    events = require('events'),
    fs = require('fs'),
    path = require('path'),
    request = require('request'),
    shell = require('shelljs'),
    options,
    callSuccess,
    callError;

/*!
 * Specification: soundwave.create(options)
 */

describe('soundwave.create(options)', function() {
    beforeEach(function() {
        options = {
            path: 'path/to/app',
            version: '3.3.0'
        };
        spyOn(soundwave.create, 'validateProjectPath');
        spyOn(soundwave.create, 'templateExists');
        spyOn(soundwave.create, 'downloadTemplate');
        spyOn(soundwave.create, 'createProject');
        callSuccess = function(options, callback) { callback(); };
        callError = function(options, callback) { callback(new Error('error')); };
    });

    it('should require options', function() {
        expect(function() {
            options = undefined;
            soundwave.create(options);
        }).toThrow();
    });

    it('should require options.path', function() {
        expect(function() {
            options.path = undefined;
            soundwave.create(options);
        }).toThrow();
    });

    it('should require options.version', function() {
        expect(function() {
            options.version = undefined;
            soundwave.create(options);
        }).toThrow();
    });

    it('should return an event emitter', function() {
        expect(soundwave.create(options)).toEqual(jasmine.any(events.EventEmitter));
    });

    describe('valid project path', function() {
        beforeEach(function() {
            soundwave.create.validateProjectPath.andCallFake(callSuccess);
        });

        describe('project template exists', function() {
            beforeEach(function() {
                soundwave.create.templateExists.andReturn(true);
            });

            it('should create the project', function(done) {
                soundwave.create(options);
                process.nextTick(function() {
                    expect(soundwave.create.createProject).toHaveBeenCalled();
                    done();
                });
            });

            describe('successfully create project', function() {
                beforeEach(function() {
                    soundwave.create.createProject.andCallFake(callSuccess);
                });

                it('should emit a complete event', function(done) {
                    soundwave.create(options).on('complete', function() {
                        done();
                    });
                });
            });

            describe('failed to create project', function() {
                beforeEach(function() {
                    soundwave.create.createProject.andCallFake(callError);
                });

                it('should emit an error event', function(done) {
                    soundwave.create(options).on('error', function(e) {
                        expect(e).toEqual(jasmine.any(Error));
                        done();
                    });
                });
            });
        });

        describe('project template missing', function() {
            beforeEach(function() {
                soundwave.create.templateExists.andReturn(false);
            });

            it('should download the template', function(done) {
                soundwave.create(options);
                process.nextTick(function() {
                    expect(soundwave.create.downloadTemplate).toHaveBeenCalled();
                    done();
                });
            });

            describe('successful download', function() {
                beforeEach(function() {
                    soundwave.create.downloadTemplate.andCallFake(callSuccess);
                });

                it('should create the project from the template', function(done) {
                    soundwave.create(options);
                    process.nextTick(function() {
                        expect(soundwave.create.createProject).toHaveBeenCalled();
                        done();
                    });
                });
            });

            describe('failed download', function() {
                beforeEach(function() {
                    soundwave.create.downloadTemplate.andCallFake(callError);
                });

                it('should emit an error event', function(done) {
                    soundwave.create(options).on('error', function(e) {
                        expect(e).toEqual(jasmine.any(Error));
                        done();
                    });
                });
            });
        });
    });

    describe('invalid project path', function() {
        beforeEach(function() {
            soundwave.create.validateProjectPath.andCallFake(callError);
        });

        it('should emit an error event', function(done) {
            soundwave.create(options).on('error', function(e) {
                expect(e).toEqual(jasmine.any(Error));
                done();
            });
        });
    });
});

describe('soundwave.create.validateProjectPath(options, callback)', function() {
    beforeEach(function() {
        options = {
            path: 'path/to/app'
        };
        spyOn(fs, 'existsSync');
        spyOn(fs, 'readdir');
    });

    describe('path does not exist', function() {
        it('should be valid', function(done) {
            fs.existsSync.andReturn(false);
            soundwave.create.validateProjectPath(options, function(e) {
                expect(e).toBeNull();
                done();
            });
        });
    });

    describe('path is empty directory', function() {
        it('should be valid', function(done) {
            fs.existsSync.andReturn(true);
            fs.readdir.andReturn(['.', '..']);
            soundwave.create.validateProjectPath(options, function(e) {
                expect(e).toBeNull();
                done();
            });
        });
    });

    describe('path contains files', function() {
        it('should be invalid', function(done) {
            fs.existsSync.andReturn(true);
            fs.readdir.andReturn(['.', '..', 'file.js']);
            soundwave.create.validateProjectPath(options, function(e) {
                expect(e).toEqual(jasmine.any(Error));
                done();
            });
        });
    });
});

describe('soundwave.create.templateExists(options)', function() {
    beforeEach(function() {
        options = {
            path: 'path/to/app',
            version: '3.3.0'
        };
        spyOn(fs, 'existsSync');
    });

    it('should test the global .cordova path', function() {
        soundwave.create.templateExists(options);
        // not the project-level .cordova/
        expect(fs.existsSync.calls[0].args[0]).not.toMatch(
            options.path
        );
        // has the full path
        expect(fs.existsSync.calls[0].args[0]).toMatch(
            '/.cordova/lib/www/phonegap/' + options.version
        );
    });

    it('should return true when directory exists', function() {
        fs.existsSync.andReturn(true);
        expect(soundwave.create.templateExists(options)).toEqual(true);
    });

    it('should return false when directory is missing', function() {
        fs.existsSync.andReturn(false);
        expect(soundwave.create.templateExists(options)).toEqual(false);
    });
});

describe('soundwave.create.downloadTemplate(options, callback)', function() {
    // find a nice way to test request
});

describe('soundwave.create.createProject(options, callback)', function() {
    beforeEach(function() {
        options = {
            path: 'path/to/app',
            version: '3.3.0'
        };
        spyOn(shell, 'mkdir');
        spyOn(shell, 'cp');
    });

    it('should create path containing the project', function() {
        soundwave.create.createProject(options);
        expect(shell.mkdir).toHaveBeenCalledWith('-p', path.resolve(options.path));
    });

    it('should create the project', function() {
        soundwave.create.createProject(options);
        expect(shell.cp.calls[0].args[0]).toEqual('-R');
        // trailing-slash is important
        expect(shell.cp.calls[0].args[1]).toMatch(
            '/.cordova/lib/www/phonegap/' + options.version + '/'
        );
        expect(shell.cp.calls[0].args[2]).toMatch(path.resolve(options.path));
    });

    describe('successfully create project', function() {
        it('should trigger callback without error', function(done) {
            soundwave.create.createProject(options, function(e) {
                expect(e).toBeNull();
                done();
            });
        });
    });

    describe('failed to create project', function() {
        beforeEach(function() {
            spyOn(shell, 'error').andReturn(new Error('an error'));
        });

        it('should trigger callback with error', function(done) {
            soundwave.create.createProject(options, function(e) {
                expect(e).toEqual(jasmine.any(Error));
                done();
            });
        });
    });
});
