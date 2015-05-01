var memoryStore = require('../lib'),
  should = require('should'),
  async = require('async');

describe('memoryStore', function () {
  var store;

  beforeEach(function () {
    store = memoryStore();
  });

  it('should be able to be created with a new', function () {
    store = new memoryStore();
    store.should.be.instanceof(memoryStore);
  });

  it('should create / release a lease', function (done) {
    var lease = store.createLease();
    lease('k', function (err, release) {
      if (err) return done(err);
      release();
      done();
    });
  });

  it('should get/set value', function (done) {
    var key = 'k', inp = 123, out = 123;
    async.waterfall([
      store.get.bind(store, key, 'f'),

      function (v, cb) {
        should(v).not.be.ok;
        cb(null);
      },

      store.set.bind(store, key, 'f', inp),
      store.get.bind(store, key, 'f'),

      function (v, cb) {
        v.should.equal(out);
        cb(null);
      }
    ], done);
  });

  it('should be able to overwrite values', function (done) {
    var key = 'k';
    async.waterfall([
      store.set.bind(store, key, 'f', 'v1'),
      store.get.bind(store, key, 'f'),

      function (value, cb) {
        value.should.equal('v1');
        cb(null);
      },

      store.set.bind(store, key, 'f', 'v2'),
      store.get.bind(store, key, 'f'),

      function (value, cb) {
        value.should.equal('v2');
        cb(null);
      }
    ], done);
  });

  it('should del', function (done) {
    var key = 'k', val = 'v';
    async.waterfall([
      store.set.bind(store, key, 'f', val),
      store.get.bind(store, key, 'f'),

      function (value, cb) {
        value.should.equal(val);
        cb(null);
      },

      store.del.bind(store, key),
      store.get.bind(store, 'k', 'f'),

      function (value, cb) {
        should(value).not.be.ok;
        cb(null);
      }
    ], done);
  });

  it('should set timeout', function (done) {
    var isTimeoutSet = false, timer;

    timer = store.createTimer();
    timer.on('timeout', function (key) {
      key.should.equal('tk');
      isTimeoutSet.should.be.ok;
      done();
    });

    function set() {
      isTimeoutSet = true;
    }

    timer.setTimeout('tk', 1, set);
  });

  describe('expire', function () {
    it('should delete a key after ttl', function (done) {
      var key = 'k', field = 'f', value = 'v1';

      async.waterfall([
        store.set.bind(store, key, field, value),
        store.expire.bind(store, key, 3),

        store.get.bind(store, key, field),
        function checkBeforeExpiration(value, cb) {
          value.should.equal(value);
          setTimeout(store.get.bind(store, key, field, cb), 6);
        },

        function checkAfterExpiration(value, cb) {
          should(value).not.be.ok;
          cb(null);
        }
      ], done);
    });

    it('should allow replacing an expire', function (done) {
      var key = 'k', field = 'f', value = 'v1';

      async.waterfall([
        store.set.bind(store, key, field, value),

        store.expire.bind(store, key, 3),
        store.expire.bind(store, key, 9),

        function check(cb) {
          setTimeout(store.get.bind(store, key, field, cb), 6);
        },

        function ensureFirstExpireDidNotDelete(value, cb) {
          value.should.equal(value);
          setTimeout(store.get.bind(store, key, field, cb), 6);
        },

        function ensureSecondExpireDidDelete(value, cb) {
          should(value).not.be.ok;
          cb(null);
        }
      ], done);
    });
  });
});
