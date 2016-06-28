// third-party dependencies
const Bluebird = require('bluebird');

// own dependencies
const initServices = require('./services/init');
const initUI       = require('./ui/init');

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

// Only start setting up thing when WebComponentsReady event is fired
window.addEventListener('WebComponentsReady', function () {

  connect().then(function (options) {
    return Bluebird.resolve(initServices(habemus, options))
      .then(() => {
        return Bluebird.resolve(initUI(habemus, options));
      });
  });


  ////////////////////
  // setup Keypress //
  var listener = new window.keypress.Listener();

  listener.simple_combo('cmd s', function() {
    habemus.saveActiveFile();
  });
});

// Export the component scope
module.exports = habemus;