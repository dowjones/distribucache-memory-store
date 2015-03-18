# Distribucache Memory Store [![Build Status](https://secure.travis-ci.org/areusjs/distribucache-memory-store.png)](http://travis-ci.org/areusjs/distribucache-memory-store) [![NPM version](https://badge.fury.io/js/distribucache-memory-store.svg)](http://badge.fury.io/js/distribucache-memory-store)

A memory (RAM) datastore for the [Distribucache](https://github.com/areusjs/distribucache) auto-repopulating cache.


## Usage

Here's what a simple service using Distribucache with memory may look like:

```js
var distribucache = require('distribucache'),
  memoryStore = require('distribucache-memory-store'),

  cacheClient = distribucache.createClient(memoryStore()),

  model = require('../model'), // for example
  cache,
  Service;

cache = cacheClient.create('my:values', {
  staleIn: '10 sec',
  populateIn: '5 sec',
  pausePopulateIn: '1 min',
  populate: function (key, cb) {
    model.get(key, cb);
  }
});

Service.get = function (key, cb) {
  cache.get(key, cb);
};
```


### API

  - `memoryStore()`


## License

[MIT](/LICENSE)

