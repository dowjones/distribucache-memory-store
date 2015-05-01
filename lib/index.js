var EventEmitter = require('events').EventEmitter,
  inherits = require('util').inherits,
  Lease = require('lease'),
  Timer = require('./Timer');

module.exports = MemoryStore;

function MemoryStore() {
  if (!(this instanceof MemoryStore)) return new MemoryStore();
  EventEmitter.call(this);
  this._store = {};
  this._timeoutIds = {};
}

inherits(MemoryStore, EventEmitter);

MemoryStore.prototype.createLease = function (ttlInMs) {
  return Lease(ttlInMs);
};

MemoryStore.prototype.createTimer = function () {
  return new Timer();
};

MemoryStore.prototype.del = function (key, cb) {
  delete this._store[key];
  process.nextTick(cb);
};

MemoryStore.prototype.expire = function (key, ttlInMs, cb) {
  if (this._timeoutIds[key]) clearTimeout(this._timeoutIds[key]);
  this._timeoutIds[key] = setTimeout(function () {
    delete this._store[key];
    delete this._timeoutIds[key];
  }.bind(this), ttlInMs);
  process.nextTick(cb);
};

MemoryStore.prototype.get = function (key, field, cb) {
  var item = this._store[key];
  if (!item) return cb(null, null);
  process.nextTick(function () {
    cb(null, item[field]);
  });
};

MemoryStore.prototype.set = function (key, field, value, cb) {
  var item = this._store[key];
  if (!item) {
    item = new Item();
    this._store[key] = item;
  }
  item[field] = value;
  process.nextTick(cb);
};

function Item() {
  this.accessedAt = null;
  this.createdAt = null;
  this.hash = null;
  this.value = null;
}
