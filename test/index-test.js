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
    testGetSet('getValue', 'setValue', done);
  });

  it('should set/get accessedAt', function (done) {
    testGetSet('getAccessedAt', 'setAccessedAt', done);
  });

  it('should set/get createdAt', function (done) {
    testGetSet('getCreatedAt', 'setCreatedAt', done);
  });

  it('should set/get hash', function (done) {
    testGetSet('getHash', 'setHash', done);
  });

  it('should be able to overwrite values', function (done) {
    var key = 'k';
    async.waterfall([
      store.setValue.bind(store, key, 'v1'),
      store.getValue.bind(store, key),

      function (value, cb) {
        value.should.equal('v1');
        cb(null);
      },

      store.setValue.bind(store, key, 'v2'),
      store.getValue.bind(store, key),

      function (value, cb) {
        value.should.equal('v2');
        cb(null);
      }
    ], done);
  });

  it('should del', function (done) {
    var key = 'k', val = 'v';
    async.waterfall([
      store.setValue.bind(store, key, val),
      store.getValue.bind(store, key),

      function (value, cb) {
        value.should.equal(val);
        cb(null);
      },

      store.del.bind(store, key),
      store.getValue.bind(store, 'k'),

      function (value, cb) {
        should(value).not.be.ok;
        cb(null);
      }
    ], done);
  });

  it('should set timeout', function (done) {
    var isTimeoutSet = false;

    store.on('timeout', function (key) {
      key.should.equal('tk');
      isTimeoutSet.should.be.ok;
      done();
    });

    function set() {
      isTimeoutSet = true;
    }

    store.setTimeout('tk', 1, set);
  });

  function testGetSet(getName, setName, done) {
    var key = 'k', inp = 123, out = 123;
    async.waterfall([
      store[getName].bind(store, key),

      function (v, cb) {
        should(v).not.be.ok;
        cb(null);
      },

      store[setName].bind(store, key, inp),
      store[getName].bind(store, key),

      function (v, cb) {
        v.should.equal(out);
        cb(null);
      }
    ], done);
  }
});
