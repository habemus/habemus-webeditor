// third-party dependencies
const Bluebird = require('bluebird');

// own dependencies
const initServices = require('./services');
const initUI       = require('./ui');
const initKeyboard = require('./keyboard');

// The application wrapper
var habemus = document.querySelector('#habemus');

new Bluebird(function (resolve, reject) {

  // Only start setting up thing when WebComponentsReady event is fired
  window.addEventListener('WebComponentsReady', function () {

    resolve();
  });
})
.then(function () {
  var options = {};

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
    });
});

// Export the component scope
module.exports = habemus;
