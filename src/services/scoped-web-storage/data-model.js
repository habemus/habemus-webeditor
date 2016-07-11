// TODO: data-model might be very useful as an isolate module

// native dependencies
const util         = require('util');
const EventEmitter = require('events');

function _iterateObject(obj, cb) {
  for (var prop in obj) {
    if (obj.hasOwnProperty(prop)) {
      cb(obj[prop], prop);
    }
  }
}

function DataModel() {
  /**
   * Object on which the in-memory version of data is stored.
   */
  this.data = {};
}
util.inherits(DataModel, EventEmitter);

/**
 * Sets key and emits required events
 */
DataModel.prototype.set = function () {
  
  if (typeof arguments[0] === 'object') {
    
    _iterateObject(arguments[0], function (newValue, key) {
      
      var oldValue = this.data[key];
      
      // only set if value has changed
      if (newValue !== oldValue) {
        
        var changeData = {
          key: key,
          oldValue: oldValue,
          newValue: newValue
        };
        
        this.data[key] = newValue;
        this.emit('change', changeData);
        this.emit('change:' + key, changeData);
      }
      
    }.bind(this));
    
  } else {
    var key = arguments[0];
    var newValue = arguments[1];
    var oldValue = this.data[key];
    
    // only set if value has changed
    if (newValue !== oldValue) {
      
      var changeData = {
        key: key,
        oldValue: oldValue,
        newValue: newValue
      };
      
      this.data[key] = newValue;
      this.emit('change', changeData);
      this.emit('change:' + key, changeData);
    }
  }
};

/**
 * Deletes the key
 */
DataModel.prototype.unset = function (key) {
  
  var oldValue = this.data[key];
  
  if (oldValue !== undefined) {
    var changeData = {
      key: key,
      oldValue: oldValue,
      newValue: undefined
    };
    
    delete this.data[key];
    this.emit('change', changeData);
    this.emit('change:' + key, changeData);
  }
};

/**
 * Retrieves the value for a given key
 */
DataModel.prototype.get = function (key) {
  return this.data[key];
};

module.exports = DataModel;
