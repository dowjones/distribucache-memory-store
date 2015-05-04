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
      store.getProp.bind(store, key, 'f'),

      function (v, cb) {
        should(v).not.be.ok;
        cb(null);
      },

      store.setProp.bind(store, key, 'f', inp),
      store.getProp.bind(store, key, 'f'),

      function (v, cb) {
        v.should.equal(out);
        cb(null);
      }
    ], done);
  });

  it('should be able to overwrite values', function (done) {
    var key = 'k';
    async.waterfall([
      store.setProp.bind(store, key, 'f', 'v1'),
      store.getProp.bind(store, key, 'f'),

      function (value, cb) {
        value.should.equal('v1');
        cb(null);
      },

      store.setProp.bind(store, key, 'f', 'v2'),
      store.getProp.bind(store, key, 'f'),

      function (value, cb) {
        value.should.equal('v2');
        cb(null);
      }
    ], done);
  });

  it('should del', function (done) {
    var key = 'k', val = 'v';
    async.waterfall([
      store.setProp.bind(store, key, 'f', val),
      store.getProp.bind(store, key, 'f'),

      function (value, cb) {
        value.should.equal(val);
        cb(null);
      },

      store.del.bind(store, key),
      store.getProp.bind(store, 'k', 'f'),

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

  describe('incrPropBy', function () {
    it('should set to value initially and incr after', function (done) {
      var key = 'k', field = 'f';
      async.waterfall([
        store.incrPropBy.bind(store, key, field, 7),

        function verifyInitial(value, cb) {
          value.should.equal(7);
          store.incrPropBy(key, field, 1, cb);
        },

        function verifyNext(value, cb) {
          value.should.equal(8);
          cb();
        }
      ], done);
    });
  });

  describe('delProp', function () {
    it('should yield immediately if ', function (done) {
      function check(err) {
        if (err) return done(err);
        arguments.length.should.equal(1);
        done();
      }
      store.delProp('k', 'f', check);
    });

    it('should delete a set property', function (done) {
      var key = 'k', field = 'f', value = 'a';
      async.waterfall([
        store.setProp.bind(store, key, field, value),

        store.getProp.bind(store, key, field),

        function verifyGet(value, cb) {
          value.should.equal(value);
          store.delProp(key, field, cb);
        },

        store.getProp.bind(store, key, field),

        function verifyDeletedProp(value, cb) {
          should(value).not.be.ok;
          cb();
        }
      ], done);
    });
  });

  describe('expire', function () {
    it('should delete a key after ttl', function (done) {
      var key = 'k', field = 'f', value = 'v1';

      async.waterfall([
        store.setProp.bind(store, key, field, value),
        store.expire.bind(store, key, 3),

        store.getProp.bind(store, key, field),
        function checkBeforeExpiration(value, cb) {
          value.should.equal(value);
          setTimeout(store.getProp.bind(store, key, field, cb), 6);
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
        store.setProp.bind(store, key, field, value),

        store.expire.bind(store, key, 3),
        store.expire.bind(store, key, 9),

        function check(cb) {
          setTimeout(store.getProp.bind(store, key, field, cb), 6);
        },

        function ensureFirstExpireDidNotDelete(value, cb) {
          value.should.equal(value);
          setTimeout(store.getProp.bind(store, key, field, cb), 6);
        },

        function ensureSecondExpireDidDelete(value, cb) {
          should(value).not.be.ok;
          cb(null);
        }
      ], done);
    });
  });
});
