// third-party dependencies
const Bluebird = require('bluebird');

// own dependencies
const initServices = require('./services/init');
const initUI       = require('./ui/init');
const initKeyboard = require('./keyboard/init');

const pkg = require('../package.json');

function connect() {
  return new Bluebird((resolve, reject) => {
    setTimeout(function () {
      resolve({
        apiVersion: pkg.version,
        hDevServerURI: 'http://localhost:5001',
        authToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjcmVhdGVkQXQiOiIyMDE2LTA2LTE2VDIwOjA1OjQ1LjkwOVoiLCJpYXQiOjE0NjYxMTAyMzgsImV4cCI6MTQ2ODcwMjIzOCwiaXNzIjoiaC1hdXRoIiwic3ViIjoiNTc2MzA2OTk4OTk1M2UwMTAwYWI0ZWI2IiwianRpIjoiNTc2MzExMWU4OTk1M2UwMTAwYWI0ZWJjIn0.d7wAJU_3NkGkvCzrtIpdx-33_oZb8dbPfYUmQ7aHQ-M',
        projectId: '577b3d13f0cea9c616509218',
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