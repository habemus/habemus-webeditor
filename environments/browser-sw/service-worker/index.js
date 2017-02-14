// third-party
const Bluebird = require('bluebird');

// Set the callback for the install step
self.addEventListener('install', function (event) {

  var options = {};

  var setupPromise = Bluebird.all([
    require('./router')(self, options),
  ])
  .then(function () {
    console.log('sw installed')
  })

  event.waitUntil(setupPromise);
});

self.addEventListener('activate', function(event) {
  event.waitUntil(self.clients.claim());
});

require('./express-service')(require('./dev-server-html5'));
