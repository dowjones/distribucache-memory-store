var Timer = require('../lib/Timer'),
  sinon = require('sinon');

describe('Timer', function () {
  var clock, noop;

  beforeEach(function () {
    noop = function () {};
    clock = sinon.useFakeTimers();
  });

  afterEach(function () {
    clock.restore();
  });

  it('should create a new timer for a key', function (done) {
    var t = new Timer();

    t.on('timeout', function (/*key*/) {
      done();
    });

    t.setTimeout('k', 50, noop);

    clock.tick(60);
  });

  it('should have different timeouts for diff keys', function (done) {
    var t = new Timer();
    var before = Date.now();
    var aTime, bTime;

    t.on('timeout', function (key) {
      if (key === 'a') {
        aTime = Date.now() - before;
      } else if (key === 'b') {
        bTime = Date.now() - before;
      }

      if (aTime & bTime) {
        aTime.should.be.within(50, 60);
        bTime.should.be.within(100, 110);
        done();
      }
    });

    t.setTimeout('a', 50, noop);
    t.setTimeout('b', 100, noop);

    clock.tick(110);
  });

  it('should reset a timeout for the same key', function (done) {
    var t = new Timer(),
      acount = 0, bcount = 0;

    t.on('timeout', function (key) {
      if (key === 'a' && ++acount > 1) {
        throw new Error('a called too many times');
      }
      if (key === 'b' && ++bcount > 1) {
        throw new Error('b called too many times');
      }
      if (acount === 1 && bcount === 1) {
        done();
      }
    });

    t.setTimeout('a', 10, noop);
    t.setTimeout('b', 50, noop);
    clock.tick(40);

    t.setTimeout('b', 50, noop);
    clock.tick(60);
  });
});
