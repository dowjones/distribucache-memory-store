var EventEmitter = require('events').EventEmitter,
  inherits = require('util').inherits;

function Timer() {
  EventEmitter.call(this);
  this._timeoutIds = {};
}

inherits(Timer, EventEmitter);

Timer.prototype.setTimeout = function (key, timeoutInMs, cb) {
  if (this._timeoutIds[key]) {
    clearTimeout(this._timeoutIds[key]);
    delete this._timeoutIds[key];
  }

  function emit() {
    this.emit('timeout', key);
    delete this._timeoutIds[key];
  }

  this._timeoutIds[key] = setTimeout(
    emit.bind(this), timeoutInMs);
  process.nextTick(cb);
};

module.exports = Timer;
