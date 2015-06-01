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

MemoryStore.prototype.getProp = function (key, field, cb) {
  var item = this._store[key];
  if (!item) return process.nextTick(cb.bind(null, null, null));
  process.nextTick(function () {
    var value = item[field];
    if ('undefined' === typeof value) return cb(null, null);
    cb(null, value);
  });
};

MemoryStore.prototype.setProp = function (key, field, value, cb) {
  var item = this._store[key];
  if (!item) {
    item = {};
    this._store[key] = item;
  }
  item[field] = value;
  process.nextTick(cb);
};

MemoryStore.prototype.incrPropBy = function (key, field, value, cb) {
  var item = this._store[key];
  if (!item) {
    item = {};
    this._store[key] = item;
  }

  value = parseInt(value, 10);
  if (!item[field]) item[field] = value;
  else item[field] += value;

  process.nextTick(cb.bind(null, null, item[field]));
};

MemoryStore.prototype.delProp = function (key, field, cb) {
  var item = this._store[key];
  if (!item) return process.nextTick(cb.bind(null, null));
  delete item[field];
  process.nextTick(cb);
};
