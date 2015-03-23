var EventEmitter = require('events').EventEmitter,
  inherits = require('util').inherits,
  Timer = require('./Timer');

module.exports = MemoryStore;

function MemoryStore() {
  if (!(this instanceof MemoryStore)) return new MemoryStore();
  EventEmitter.call(this);
  this._store = {};
}

inherits(MemoryStore, EventEmitter);

MemoryStore.prototype.createLease = function () {
  // we don't need a real lock/lease because the
  // store is designed to be run in one process
  return function fakeLease(key, cb) {
    process.nextTick(function () {
      cb(null, function release() {});
    });
  };
};

MemoryStore.prototype.createTimer = function () {
  return new Timer();
};

MemoryStore.prototype.del = function (key, cb) {
  delete this._store[key];
  process.nextTick(cb);
};

MemoryStore.prototype.getAccessedAt = function (key, cb) {
  this._get(key, 'accessedAt', cb);
};

MemoryStore.prototype.getCreatedAt = function (key, cb) {
  this._get(key, 'createdAt', cb);
};

MemoryStore.prototype.getHash = function (key, cb) {
  this._get(key, 'hash', cb);
};

MemoryStore.prototype.getValue = function (key, cb) {
  this._get(key, 'value', cb);
};

MemoryStore.prototype.setAccessedAt = function (key, accessedAt, cb) {
  this._set(key, 'accessedAt', accessedAt, cb);
};

MemoryStore.prototype.setCreatedAt = function (key, createdAt, cb) {
  this._set(key, 'createdAt', createdAt, cb);
};

MemoryStore.prototype.setHash = function (key, hash, cb) {
  this._set(key, 'hash', hash, cb);
};

MemoryStore.prototype.setValue = function (key, value, cb) {
  this._set(key, 'value', value, cb);
};

MemoryStore.prototype._get = function (key, name, cb) {
  var item = this._store[key];
  if (!item) return cb(null, null);
  process.nextTick(function () {
    cb(null, item[name]);
  });
};

MemoryStore.prototype._set = function (key, name, data, cb) {
  var item = this._store[key];
  if (!item) {
    item = new Item();
    this._store[key] = item;
  }
  item[name] = data;
  process.nextTick(cb);
};

function Item() {
  this.accessedAt = null;
  this.createdAt = null;
  this.hash = null;
  this.value = null;
}
