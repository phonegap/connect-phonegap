/*!
 * Module dependencies.
 */

var events = require('events'),
    gaze = require('gaze'),
    phonegap = require('../../lib'),
    gazeSpy,
    pg;

/*!
 * Specification: Browser middleware.
 */

describe('browser middleware', function() {
    beforeEach(function() {
        // replace the Gaze module with our own event emitter because we will
        // be faking the modification of the file system using Gaze's events.
        gazeSpy = new events.EventEmitter();
        spyOn(gaze, 'Gaze').andReturn(gazeSpy);
    });

    describe('on file change', function() {
        it('should call cordova prepare', function(done) {
            // in order to test that 'cordova prepare' was called, we need
            // to spy on a fake instance of the cordova module. To do this,
            // we create a jasmine spy and give it the easy to remember
            // identifier of 'cordova'.
            var options = {
                phonegap: {
                    cordova: jasmine.createSpy('cordova')
                }
            };

            // create our connect-phonegap instance
            pg = phonegap(options);

            // ---
            // it's worth noting that if we add additional tests to the
            // 'on file change' describe, then we could move the above
            // two lines of code into a beforeEach block under the 'on file change'
            // describe.
            // ----

            // now it's time to test the cordova prepare event. We do this by
            // faking a modification to our file system using our Gaze spy.
            // The event name 'all' is important because that's the event we
            // are listening for in the browser middleware. The other options
            // are not required, so we give them values that describe their
            // type.
            gazeSpy.emit('all', 'eventType', '/path/to/file.js');

            // to avoid a race-condition, we want until the next process tick.
            // This will give the browser an opportunity to respond to the 'all'
            // event that was triggered above.
            process.nextTick(function() {
                // we expect that the browser middleware responded to the 'all'
                // event and used the cordova instance to prepare the browser.
                expect(options.phonegap.cordova)
                    .toHaveBeenCalledWith({ cmd: 'cordova prepare browser' });
                // we call jasmine's done function because this test was async.
                // Since we waited on process tick, the test because async
                // so jasmine needs to be told when we expect it to be finished.
                done();
            });
        });
    });
});
