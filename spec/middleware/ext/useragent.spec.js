/*!
 * Module dependencies.
 */

var useragent = require('../../../lib/middleware/ext/useragent'),
    request;

/*!
 * Specification: useragent detection (ewww)
 */

describe('useragent', function() {
    beforeEach(function() {
        request = {
            android: 'Mozilla/5.0 (Linux; U; Android 4.2.1; en-us; Galaxy ' +
                     'Nexus Build/JOP40D) AppleWebKit/534.30 (KHTML, like ' +
                     'Gecko) Version/4.0 Mobile Safari/534.30',
            ios: 'Mozilla/5.0 (iPhone; CPU iPhone OS 7_0_4 like Mac OS X) ' +
                 'AppleWebKit/537.51.1 (KHTML, like Gecko) Mobile/11B554a ' +
                 '(376051744)'
        };
    });

    describe('.parse', function() {
        it('should return an Agent', function() {
            expect(useragent.parse(request.ios)).toEqual(jasmine.any(Object));
        });
    });

    describe('Agent', function() {
        describe('when iOS', function() {
            describe('agent.ios', function() {
                it('should be true', function() {
                    expect(useragent.parse(request.ios).ios).toBe(true);
                });
            });

            describe('agent.platform', function() {
                it('should return "ios"', function() {
                    expect(useragent.parse(request.ios).platform).toEqual('ios');
                });
            });
        });

        describe('when Android', function() {
            describe('agent.android', function() {
                it('should be true', function() {
                    expect(useragent.parse(request.android).android).toBe(true);
                });
            });

            describe('agent.platform', function() {
                it('should return "android"', function() {
                    expect(useragent.parse(request.android).platform).toEqual('android');
                });
            });
        });
    });
});
