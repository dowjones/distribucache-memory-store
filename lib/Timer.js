var EventEmitter = require('events').EventEmitter,
  inherits = require('util').inherits,
  Timer;

module.exports = Timer;

function Timer() {
  EventEmitter.call(this);
}

inherits(Timer, EventEmitter);

Timer.prototype.setTimeout = function (key, timeoutInMs, cb) {
  function emit() { this.emit('timeout', key); }
  setTimeout(emit.bind(this), timeoutInMs);
  process.nextTick(cb);
};
