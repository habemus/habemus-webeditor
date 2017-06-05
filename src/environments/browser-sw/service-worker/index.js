// define a window variable so that 
// libraries that depend on checking for `window` do not
// throw errors
var window = {};

// third-party
const Bluebird = require('bluebird');
const mkdirp = require('mkdirp');

const mkdirpAsync = Bluebird.promisify(mkdirp);

// Set the callback for the install step
self.addEventListener('install', function (event) {

  // var options = {};

  // var setupPromise = Bluebird.all([,
  // ])
  // .then(function () {
  //   console.log('sw installed')
  // })
  console.log('running install')
  event.waitUntil(mkdirpAsync('/projects').then(function () {
    console.log('projects dir created');
  }));
});


require('./router')(self, {});

self.addEventListener('activate', function(event) {
  event.waitUntil(self.clients.claim());
});

require('./express-service')(require('./dev-server-html5'));
