/*!
 * Module dependencies.
 */

var events = require('events'),
    fs = require('fs'),
    path = require('path'),
    phonegap = require('../lib'),
    request = require('request'),
    shell = require('shelljs'),
    callSuccess,
    callError,
    options;

/*!
 * Specification: phonegap.create(options)
 */

describe('phonegap.create(options)', function() {
    beforeEach(function() {
        options = {
            path: 'path/to/app',
            version: '3.3.0'
        };
        spyOn(phonegap.create, 'validateProjectPath');
        spyOn(phonegap.create, 'templateExists');
        spyOn(phonegap.create, 'downloadTemplate');
        spyOn(phonegap.create, 'createProject');
        callSuccess = function(options, callback) { callback(); };
        callError = function(options, callback) { callback(new Error('error')); };
    });

    it('should require options', function() {
        expect(function() {
            options = undefined;
            phonegap.create(options);
        }).toThrow();
    });

    it('should require options.path', function() {
        expect(function() {
            options.path = undefined;
            phonegap.create(options);
        }).toThrow();
    });

    it('should require options.version', function() {
        expect(function() {
            options.version = undefined;
            phonegap.create(options);
        }).toThrow();
    });

    it('should return an event emitter', function() {
        expect(phonegap.create(options)).toEqual(jasmine.any(events.EventEmitter));
    });

    describe('valid project path', function() {
        beforeEach(function() {
            phonegap.create.validateProjectPath.andCallFake(callSuccess);
        });

        describe('project template exists', function() {
            beforeEach(function() {
                phonegap.create.templateExists.andReturn(true);
            });

            it('should create the project', function(done) {
                phonegap.create(options);
                process.nextTick(function() {
                    expect(phonegap.create.createProject).toHaveBeenCalled();
                    done();
                });
            });

            describe('successfully create project', function() {
                beforeEach(function() {
                    phonegap.create.createProject.andCallFake(callSuccess);
                });

                it('should emit a complete event', function(done) {
                    phonegap.create(options).on('complete', function() {
                        done();
                    });
                });
            });

            describe('failed to create project', function() {
                beforeEach(function() {
                    phonegap.create.createProject.andCallFake(callError);
                });

                it('should emit an error event', function(done) {
                    phonegap.create(options).on('error', function(e) {
                        expect(e).toEqual(jasmine.any(Error));
                        done();
                    });
                });
            });
        });

        describe('project template missing', function() {
            beforeEach(function() {
                phonegap.create.templateExists.andReturn(false);
            });

            it('should download the template', function(done) {
                phonegap.create(options);
                process.nextTick(function() {
                    expect(phonegap.create.downloadTemplate).toHaveBeenCalled();
                    done();
                });
            });

            describe('successful download', function() {
                beforeEach(function() {
                    phonegap.create.downloadTemplate.andCallFake(callSuccess);
                });

                it('should create the project from the template', function(done) {
                    phonegap.create(options);
                    process.nextTick(function() {
                        expect(phonegap.create.createProject).toHaveBeenCalled();
                        done();
                    });
                });
            });

            describe('failed download', function() {
                beforeEach(function() {
                    phonegap.create.downloadTemplate.andCallFake(callError);
                });

                it('should emit an error event', function(done) {
                    phonegap.create(options).on('error', function(e) {
                        expect(e).toEqual(jasmine.any(Error));
                        done();
                    });
                });
            });
        });
    });

    describe('invalid project path', function() {
        beforeEach(function() {
            phonegap.create.validateProjectPath.andCallFake(callError);
        });

        it('should emit an error event', function(done) {
            phonegap.create(options).on('error', function(e) {
                expect(e).toEqual(jasmine.any(Error));
                done();
            });
        });
    });
});

describe('phonegap.create.validateProjectPath(options, callback)', function() {
    beforeEach(function() {
        options = {
            path: 'path/to/app'
        };
        spyOn(fs, 'existsSync');
        spyOn(fs, 'readdirSync');
    });

    describe('path does not exist', function() {
        it('should be valid', function(done) {
            fs.existsSync.andReturn(false);
            phonegap.create.validateProjectPath(options, function(e) {
                expect(e).toBeNull();
                done();
            });
        });
    });

    describe('path is empty directory', function() {
        it('should be valid', function(done) {
            fs.existsSync.andReturn(true);
            fs.readdirSync.andReturn(['.', '..']);
            phonegap.create.validateProjectPath(options, function(e) {
                expect(e).toBeNull();
                done();
            });
        });
    });

    describe('path contains files', function() {
        it('should be invalid', function(done) {
            fs.existsSync.andReturn(true);
            fs.readdirSync.andReturn(['.', '..', 'file.js']);
            phonegap.create.validateProjectPath(options, function(e) {
                expect(e).toEqual(jasmine.any(Error));
                done();
            });
        });
    });
});

describe('phonegap.create.templateExists(options)', function() {
    beforeEach(function() {
        options = {
            path: 'path/to/app',
            version: '3.3.0'
        };
        spyOn(fs, 'existsSync');
    });

    it('should test the global .cordova path', function() {
        phonegap.create.templateExists(options);
        // not the project-level .cordova/
        expect(fs.existsSync.calls[0].args[0]).not.toMatch(
            options.path
        );
        // has the full path
        expect(fs.existsSync.calls[0].args[0]).toEqual(
            phonegap.create.templatePath(options)
        );
    });

    it('should return true when directory exists', function() {
        fs.existsSync.andReturn(true);
        expect(phonegap.create.templateExists(options)).toEqual(true);
    });

    it('should return false when directory is missing', function() {
        fs.existsSync.andReturn(false);
        expect(phonegap.create.templateExists(options)).toEqual(false);
    });
});

describe('phonegap.create.downloadTemplate(options, callback)', function() {
    // find a nice way to test request
});

describe('phonegap.create.createProject(options, callback)', function() {
    beforeEach(function() {
        options = {
            path: 'path/to/app',
            version: '3.3.0'
        };
        spyOn(shell, 'mkdir');
        spyOn(shell, 'cp');
    });

    it('should create path containing the project', function() {
        phonegap.create.createProject(options);
        expect(shell.mkdir).toHaveBeenCalledWith('-p', path.resolve(options.path));
    });

    it('should create the project', function() {
        phonegap.create.createProject(options);
        expect(shell.cp.calls[0].args[0]).toEqual('-R');
        // trailing-slash is important
        expect(shell.cp.calls[0].args[1]).toEqual(
            path.join(phonegap.create.templatePath(options), '/')
        );
        expect(shell.cp.calls[0].args[2]).toEqual(path.resolve(options.path));
    });

    describe('successfully create project', function() {
        it('should trigger callback without error', function(done) {
            phonegap.create.createProject(options, function(e) {
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
            phonegap.create.createProject(options, function(e) {
                expect(e).toEqual(jasmine.any(Error));
                done();
            });
        });
    });
});
