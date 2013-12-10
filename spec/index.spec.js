/*!
 * Module dependencies.
 */

var soundwave = require('../lib'),
    options;

/*!
 * soundwave specification.
 */

describe('soundwave.serve(options, callback)', function() {
  beforeEach(function() {
    options = {};
  });

  it('sound be defined', function() {
    expect(soundwave.serve).toEqual(jasmine.any(Function));
  });
});
