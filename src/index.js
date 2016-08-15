// third-party dependencies
const Bluebird = require('bluebird');

// own dependencies
const initServices = require('./services/init');
const initUI       = require('./ui/init');
const initKeyboard = require('./keyboard/init');

// The application wrapper
var habemus = document.querySelector('#habemus');

// Only start setting up thing when WebComponentsReady event is fired
window.addEventListener('WebComponentsReady', function () {

  return Bluebird.resolve(
      // services will load configurations as well
      // and make them available as a service (habemus.services.config)
      initServices(habemus)
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
