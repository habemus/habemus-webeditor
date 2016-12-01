// third-party dependencies
const Bluebird = require('bluebird');

// own dependencies
const initServices = require('./services');
const initUI       = require('./ui');
const initKeyboard = require('./keyboard');

// The application wrapper
var habemus = document.querySelector('#habemus');

// expose habemus as a global variable
window.HABEMUS = habemus;

new Bluebird(function (resolve, reject) {

  // Only start setting up thing when WebComponentsReady event is fired
  window.addEventListener('WebComponentsReady', function () {
    resolve();
  });
})
.then(function () {

  /**
   * TODO: define better usage of these options.
   *
   * @type {Object}
   */
  var options = {};

  /**
   * Define a set of constants onto habemus singleton
   */
  habemus.constants = require('./constants');

  return Bluebird.resolve(
      // services will load configurations as well
      // and make them available as a service (habemus.services.config)
      initServices(habemus, options)
    )
    .then(function () {
      return Bluebird.resolve(
        initUI(
          habemus,
          habemus.services.config
        )
      );
    })
    .then(function () {
      return Bluebird.resolve(
        initKeyboard(
          habemus,
          habemus.services.config
        )
      );
    })
    .then(function () {

      // dev: set structure mode to LCR
      // habemus.ui.structure.setMode('LCR');

    });
});

// Export the component scope
module.exports = habemus;
