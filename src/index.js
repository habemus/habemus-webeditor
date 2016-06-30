// third-party dependencies
const Bluebird = require('bluebird');

// own dependencies
const initServices = require('./services/init');
const initUI       = require('./ui/init');
const initKeyboard = require('./keyboard/init');

function connect() {
  return new Bluebird((resolve, reject) => {
    setTimeout(function () {
      resolve({
        // fake config goes here
      });
    }, 400);
  });
}

// The application wrapper
var habemus = document.querySelector('#habemus');

window.habemus = habemus;

// Only start setting up thing when WebComponentsReady event is fired
window.addEventListener('WebComponentsReady', function () {

  connect().then(function (options) {
    return Bluebird.resolve(initServices(habemus, options))
      .then(() => {
        return Bluebird.resolve(initUI(habemus, options));
      })
      .then(() => {
        return Bluebird.resolve(initKeyboard(habemus, options));
      });
  });
});

// Export the component scope
module.exports = habemus;