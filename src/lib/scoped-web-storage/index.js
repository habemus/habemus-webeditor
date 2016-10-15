// native dependencies
const util         = require('util');

const DataModel = require('./data-model');

const TRAILING_UNDERLINE_RE = /_$/;

function ScopedWebStorage(prefix, localStorageAPI) {
  if (!localStorageAPI) {
    throw new Error('localStorageAPI is required');
  }
  
  if (!prefix) {
    throw new Error('prefix is required');
  }
  
  DataModel.call(this);

  // ensure trailing '_'
  prefix = TRAILING_UNDERLINE_RE.test(prefix) ? prefix : prefix + '_';
  
  this.prefix   = prefix;
  this.prefixRe = new RegExp('^' + prefix + '(.+)')
  this.ls       = localStorageAPI;
  
  // load data before attaching event handlers.
  // especially before start listening to changes on this instance
  this._load();
  
  // bind event handlers and attach them to the events
  this._handleStorageEvent = this._handleStorageEvent.bind(this);
  window.addEventListener('storage', this._handleStorageEvent, false);

  this._handleOwnChange = this._handleOwnChange.bind(this);
  this.on('change', this._handleOwnChange);
}
util.inherits(ScopedWebStorage, DataModel);

/**
 * Private method that generates the prefixed key
 */
ScopedWebStorage.prototype._prefix = function (key) {
  return this.prefix + key;
};

/**
 * Private method that removes the prefix from the key.
 * If the prefix is not present in the given key,
 * returns false.
 */
ScopedWebStorage.prototype._unprefix = function (fullKey) {
  // attempt to match the changedKey against the prefix regular expression
  var match = fullKey.match(this.prefixRe);
  
  if (match) {
    return match[1];
  } else {
    return false;
  }
};

ScopedWebStorage.prototype._handleStorageEvent = function (e) {
  // https://developer.mozilla.org/en-US/docs/Web/API/StorageEvent
  // storage events happen at a global level and we should check
  // if the storage change event refers to a key relevant
  // to this instance
  var unprefixed = this._unprefix(e.key);
  if (unprefixed) {
    this.set(unprefixed, e.newValue);
  }
};

ScopedWebStorage.prototype._handleOwnChange = function (e) {
  // whenever changes happen in this instance,
  // set the changes into the localStorage.
  // according to specs, the storage event is not emitted
  // on the same page/tab that the storage change was made
  // according to MDN:
  // "The StorageEvent is fired whenever a change is made to the Storage object.
  // This won't work on the same page that is making the changes — 
  // it is really a way for other pages on the domain using the storage 
  // to sync any changes that are made. Pages on other domains can't access 
  // the same storage objects."
  // (https://developer.mozilla.org/en-US/
  // docs/Web/API/Web_Storage_API/Using_the_Web_Storage_API)
  
  var lsKey = this._prefix(e.key);
  this.ls.setItem(lsKey, e.newValue);
};

/**
 * Loads data from the localStorage.
 * Loops through localStorage keys to check
 * which are relevant to this instance.
 * 
 * Used upon initialization.
 */
ScopedWebStorage.prototype._load = function () {
  
  var ls = this.ls;
  
  for (var i = 0; i < ls.length; i++) {
    var key = ls.key(i);
    var value = ls.getItem(key);
    
    var unprefixed = this._unprefix(key);
    if (unprefixed) {
      this.set(unprefixed, value);
    }
  }
};


/**
 * Methods that emulate WebStorage-ish interface
 */
ScopedWebStorage.prototype.setItem = function (key, value) {
  this.set(key, value);
};

ScopedWebStorage.prototype.getItem = function (key) {
  return this.get(key);
};

module.exports = ScopedWebStorage;
