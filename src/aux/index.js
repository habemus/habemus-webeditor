/**
 * Defines a property that cannot be modified
 * 
 * @param  {Object} obj
 * @param  {String} prop
 * @param  {*} value
 */
exports.defineFrozenProperty = function (obj, prop, value) {
  return Object.defineProperty(obj, prop, {
    configurable: false,
    enumerable: true,
    writable: false,
    value: value,
  });
};

exports.defineFrozenProperties = function (obj, values) {

  var _values = {};

  for (var prop in values) {
    _values[prop] = {
      configurable: false,
      enumerable: true,
      writable: false,
      value: values[prop],
    };
  }

  return Object.defineProperties(obj, _values);
};
