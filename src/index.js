// third-party dependencies
const Bluebird = require('bluebird');

// hb-dependencies (dependencies that are injected for each environment)
const hbLoadConfig = require('hb-service-config');

// own dependencies
const initServices = require('./services/init');
const initUI       = require('./ui/init');
const initKeyboard = require('./keyboard/init');

// The application wrapper
var habemus = document.querySelector('#habemus');

window.habemus = habemus;

// Only start setting up thing when WebComponentsReady event is fired
window.addEventListener('WebComponentsReady', function () {

  hbLoadConfig().then(function (options) {
    return Bluebird.resolve(initServices(habemus, options))
      .then(function () {
        return Bluebird.resolve(initUI(habemus, options));
      })
      .then(function () {
        return Bluebird.resolve(initKeyboard(habemus, options));
      });
  });
});

// Export the component scope
module.exports = habemus;
